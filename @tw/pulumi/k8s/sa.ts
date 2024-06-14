import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { getConfigs } from '../utils';
import { getK8sProvider, K8sProvider } from './provider';
import { GCPServiceAccount } from '../iam';
import { k8sGetGCPServiceAccount } from '../service';

const serviceAccounts = {};
const k8sServiceAccounts = {};

const boundSas = {};

export function createK8sServiceAccount(args?: {
  provider?: K8sProvider;
  serviceAccount?: GCPServiceAccount;
  name?: string;
}): { k8sServiceAccount: kubernetes.core.v1.ServiceAccount } {
  const { serviceId } = getConfigs();
  const {
    provider = getK8sProvider(),
    serviceAccount = k8sGetGCPServiceAccount(),
    name = serviceId,
  } = args || {};
  if (!serviceAccount) return;
  const key = `${name}-${provider.uuid}`;
  let k8sServiceAccount;
  if (!serviceAccounts[key]) {
    k8sServiceAccount = new kubernetes.core.v1.ServiceAccount(
      key,
      {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: {
          name: name,
          annotations: {
            'iam.gke.io/gcp-service-account': serviceAccount.email,
          },
        },
      },
      { provider: provider }
    );

    addWorkloadIdentityUserToSa({
      serviceAccount,
      provider,
      name,
    });
    serviceAccounts[key] = k8sServiceAccount;
  } else {
    k8sServiceAccount = serviceAccounts[key];
  }
  return { k8sServiceAccount };
}

export function addWorkloadIdentityUserToSa(args: {
  serviceAccount: GCPServiceAccount;
  provider: K8sProvider;
  name: string;
}) {
  const { serviceAccount, name, provider } = args;
  const { projectId } = getConfigs();
  // if we have two clusters then if we removed one - the binding will be removed from the other too
  if (boundSas[serviceAccount.uuid]) {
    return;
  }
  boundSas[serviceAccount.uuid] = true;
  // serviceAccount:${projectId}.svc.id.goog[${namespace}/${k8sServiceAccount.metadata.name}]
  new gcp.serviceaccount.IAMBinding(
    `${name}-bind-wiu-${serviceAccount.uuid}`,
    {
      serviceAccountId: serviceAccount.id,
      role: 'roles/iam.workloadIdentityUser',
      members: [
        pulumi.interpolate`serviceAccount:${projectId}.svc.id.goog[${provider.namespace}/${name}]`,
      ],
    },
    {
      deleteBeforeReplace: true,
      retainOnDelete: true,
    }
  );
}
