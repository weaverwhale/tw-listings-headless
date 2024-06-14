import { getGitRepoName } from '@tw/devops';
import { getConfigs } from './getConfigs';

export async function getGitFullUrl() {
  const { serviceId } = getConfigs();
  const name = await getGitRepoName();
  return `https://github.com/Triple-Whale/${name}/tree/master/services/${serviceId}`;
}
