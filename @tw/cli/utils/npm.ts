import SemVer = require('semver/classes/semver');
import { loadPackageJson } from '../utils';
import { getGitSha } from '@tw/devops';
import { cliExit } from './exit';

export async function npmVersion(
  packagePath: string,
  type: 'patch' | 'prerelease',
  branch?: string
) {
  const packageJson = await loadPackageJson({ packagePath });
  if (!packageJson.name.startsWith('@tw/')) {
    cliExit(`Package name must start with @tw/ but got ${packageJson.name}`);
  }
  const semver = new SemVer(packageJson.version);
  let version;
  if (type === 'prerelease') {
    const sha = await getGitSha();
    version = semver.inc(type, `${branch}-${sha}`);
  } else {
    version = semver.inc(type);
  }
  return version.version.replaceAll('_', '-');
}
