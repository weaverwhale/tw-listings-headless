import * as path from 'path';
import * as fs from 'fs';
import { getApplicableStacks, triggerCloudBuilds } from '../../utils/cloudBuild';
import { cliError } from '../../utils/logs';
import { getCurrentBranch } from '../../utils/git';
import { loadPulumiProject } from '../../utils/pulumi';
import { getGitRepoName, getGithubOrg } from '@tw/devops';
import { getPulumiPaths } from './getPaths';
import { cliExit } from '../../utils/exit';

export async function runPulumiRefresh(argv, justTrigger = false) {
  delete process.env.IS_LOCAL;

  const { gitRoot, dirsAbsolute } = await getPulumiPaths(argv);
  const applicableStacks = await getApplicableStacks(argv, dirsAbsolute);
  for (const dirAbsolute of dirsAbsolute) {
    const pathFromGitRoot = path.relative(gitRoot, dirAbsolute);

    if (!fs.existsSync(path.join(dirAbsolute, 'Pulumi.yaml'))) {
      cliExit('Provided path is not a pulumi project');
    }

    const pulumiProject = (await loadPulumiProject(dirAbsolute)).name;
    const repo = await getGitRepoName();
    const branch = await getCurrentBranch();
    const substitutions = {
      _SERVICE_ID: pulumiProject,
      _PULUMI_PROJECT: pulumiProject,
      _PATH: pathFromGitRoot,
      _BRANCH_NAME: branch,
      _REPO: repo,
      _GITHUB_ORG: await getGithubOrg(),
    };

    for (let stack of applicableStacks) {
      await triggerCloudBuilds({
        argv,
        buildNames: ['pulumi-refresh'],
        substitutions,
        dirs: [dirAbsolute],
        applicableStacks: [stack],
      });
    }
  }
}
