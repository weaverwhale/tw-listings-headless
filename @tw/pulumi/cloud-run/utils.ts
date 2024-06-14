import * as gcp from '@pulumi/gcp';

export function getCloudRunUrl(cloudRunService: gcp.cloudrun.Service) {
  return cloudRunService.statuses[0].url;
}
