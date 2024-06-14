import * as gcp from '@pulumi/gcp';

export function getDefaultComputeServiceAccount() {
  return gcp.compute.getDefaultServiceAccount({}).then((sa) => sa.email);
}
