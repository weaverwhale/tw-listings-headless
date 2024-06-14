import { getDefaultComputeServiceAccount } from '../iam/';
import { k8sGetGCPServiceAccount } from '../service';

export function getServiceAccountForService() {
  const serviceAccountEmail = k8sGetGCPServiceAccount()?.email;
  if (serviceAccountEmail) return serviceAccountEmail;
  return getDefaultComputeServiceAccount();
}
