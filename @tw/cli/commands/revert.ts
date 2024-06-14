import * as path from 'path';
import { exit } from 'node:process';
import { selectServices } from '../enquirer/selectServices';
import { triggerCloudBuilds } from '../utils/cloudBuild';
import { getServiceInfo } from '../utils/fs';
import { cliError, cliLog } from '../utils/logs';
import { selectTagForRevert } from '../enquirer/selectTagForRevert';
import { loadPulumiProject } from '../utils/pulumi';
import { getCurrentBranch } from '../utils/git';
import { getGitRepoName, getGithubOrg } from '@tw/devops';
import { confirm } from '../enquirer/confirm';
import { cliExit } from '../utils/exit';

export async function runRevert(argv) {
  let serviceId: string;

  if (argv.select || !argv.service) {
    serviceId = await selectServices(false);
  } else {
    serviceId = argv.service;
  }
  if (!serviceId) {
    cliExit('No service selected');
  }
  const service = await getServiceInfo(serviceId);

  let tag: string;
  if (argv.sha) {
    tag = argv.tag;
  } else {
    tag = await selectTagForRevert(serviceId);
  }

  const dir = path.join(service.servicePath, 'infra');

  const pulumiProject = (await loadPulumiProject(dir)).name;
  const repo = await getGitRepoName();
  const branch = await getCurrentBranch();
  const substitutions = {
    _SERVICE_ID: pulumiProject,
    _PULUMI_PROJECT: pulumiProject,
    _PATH: `services/${serviceId}/infra`,
    _BRANCH_NAME: 'master',
    _GITHUB_SHA: tag,
    _REPO: repo,
    _GITHUB_ORG: await getGithubOrg(),
  };

  cliLog(`Reverting ${serviceId} to commit ${tag}`);
  await confirm('OK to continue with revert?');
  await triggerCloudBuilds({
    argv,
    buildNames: ['pulumi-up'],
    substitutions,
    dirs: [dir],
    applicableStacks: ['shofifi'],
    envs: ['F=true'],
  });
}
