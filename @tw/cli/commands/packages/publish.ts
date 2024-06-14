import { exit } from 'node:process';
import { selectPackages } from '../../enquirer/selectPackages';
import { triggerCloudBuilds } from '../../utils/cloudBuild';
import { getPackageInfo } from '../../utils/fs';
import { getCurrentBranch, gitPull, packagesGitUrl } from '../../utils/git';
import toml from 'toml';
import fs from 'fs';
import { cliSuccess, cliError } from '../../utils/logs';
import { npmVersion } from '../../utils/npm';
import { pipVersion } from '../../utils/pip';
import { getGitRepoName, getGitUrl, getGithubOrg } from '@tw/devops';
import { runNpmTest } from '../../utils/runNpmTest';
import { cliExit } from '../../utils/exit';

export async function runPublish(argv) {
  const girUrl = await getGitUrl();
  let packages: string[] = argv.packages;
  if (argv.select || !packages.length) {
    if (girUrl === packagesGitUrl) {
      packages = await selectPackages();
    } else {
      cliExit('You must specify the package name');
    }
  }
  if (!packages) {
    cliExit('No packages selected');
  }
  const branch = await getCurrentBranch();
  argv.project = branch === 'master' ? 'shofifi' : 'triple-whale-staging';
  process.env.PROJECT_ID = argv.project;
  await gitPull();
  const pkgInfos = await Promise.all(packages.map((pkg) => getPackageInfo(pkg)));

  if (argv.unitTests) {
    const tests = pkgInfos
      .filter((p) => p.runtime === 'node')
      .map((pkg) => runNpmTest({ name: pkg.packageName, absolutePath: pkg.absolutePath }, argv));
    await Promise.all(tests);
  }

  const promises = [];
  for (const { packageName, absolutePath, packagePath, runtime } of pkgInfos) {
    const { version, substitutions } = await getNextVersion(
      argv.project,
      absolutePath,
      branch,
      runtime
    );

    promises.push(
      await triggerCloudBuilds({
        argv,
        buildNames: [runtime === 'node' ? 'publish-package' : 'publish-python-package'],
        substitutions: {
          _PACKAGE_DIR: packagePath || '.',
          _PACKAGE_NAME: packageName,
          _BRANCH_NAME: branch,
          _REPO: await getGitRepoName(),
          _GITHUB_ORG: await getGithubOrg(),
          ...substitutions,
        },
      })
    );
    if (runtime === 'node') {
      cliSuccess(`<${packageName}> Install with: ${packageName}@${version}`);
    } else {
      cliSuccess(`<${packageName}> New version will be: ${version}`);
    }
  }
  await Promise.all(promises);
}

async function getNextVersion(
  project,
  absolutePath: string,
  branch: string,
  runtime: 'node' | 'python'
) {
  let version: string;
  let versionSuffix;
  const substitutions = {};
  if (runtime === 'node') {
    const preid = branch.replaceAll('_', '-').replaceAll('/', '-');
    version = await npmVersion(absolutePath, project === 'shofifi' ? 'patch' : 'prerelease', preid);
    substitutions['_VERSION'] = version;
    substitutions['_PREID'] = preid;
  } else {
    const currentVer = toml.parse(fs.readFileSync(absolutePath + '/bumpver.toml').toString())
      .bumpver.current_version;
    ({ versionSuffix, version } = await pipVersion(
      currentVer,
      project === 'shofifi' ? 'patch' : 'prerelease'
    ));
    substitutions['_VERSION'] = version;
    substitutions['_TW_VERSION_SUFFIX'] = versionSuffix;
  }
  return { version, substitutions };
}
