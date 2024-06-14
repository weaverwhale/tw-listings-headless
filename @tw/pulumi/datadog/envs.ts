import * as pulumi from '@pulumi/pulumi';
import * as kubernetes from '@pulumi/kubernetes';
import { getConfigs } from '../utils';
import { getGitRepoName, getGitSha } from '@tw/devops';

export function getDDEnvs() {
  const { projectId, serviceId } = getConfigs();
  const gitSha = getGitSha(false);
  const envs: kubernetes.types.input.core.v1.EnvVar[] = [
    { name: 'DD_ENV', value: projectId },
    { name: 'DD_SERVICE', value: serviceId },
    {
      name: 'DD_TAGS',
      value: pulumi.interpolate`git.commit.sha:${pulumi.output(
        gitSha
      )},git.repository_url:github.com/Triple-Whale/${pulumi.output(getGitRepoName())}`,
    },
  ];
  return envs;
}
