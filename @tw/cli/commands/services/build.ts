import { exit } from 'node:process';
import { cliError } from '../../utils/logs';
import fs from 'fs';
import { triggerCloudBuilds } from '../../utils/cloudBuild';
import { getGitRepoName, getGitUrl, getGithubOrg } from '@tw/devops';
import { getCurrentBranch } from '../../utils/git';
import { cliExit } from '../../utils/exit';

export async function buildService(argv) {
  const dir: string = argv.dir || argv._.slice(1)[0];
  const branch = await getCurrentBranch();
  if (!dir) {
    cliExit('No dir.');
  }
  const runtime = fs.existsSync(`${dir}/package.json`) ? 'node' : 'python';
  await triggerCloudBuilds({
    argv,
    buildNames: ['build-service'],
    substitutions: {
      _RUNTIME: runtime,
      _SERVICE_DIR: dir,
      _SERVICE_ID: dir.split('/').pop(),
      _BRANCH_NAME: branch,
      _REPO: await getGitRepoName(),
      _GITHUB_ORG: await getGithubOrg(),
    },
  });
}
