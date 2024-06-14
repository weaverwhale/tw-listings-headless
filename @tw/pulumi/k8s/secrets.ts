import * as kubernetes from '@pulumi/kubernetes';
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { K8sProvider } from './provider';
import { DependsOn, toYamlOutput } from '../pulumi-utils';
import { getConfigs } from '../utils';

const secrets = {};

export function createK8sSecret(args: {
  gcpSecretVersion: gcp.secretmanager.SecretVersion;
  provider: K8sProvider;
}): { k8sSecret: kubernetes.apiextensions.CustomResource } {
  const { serviceId } = getConfigs();
  const { gcpSecretVersion, provider } = args;
  const key = `secret-${provider.uuid}`;
  if (!secrets[key]) {
    const k8sSecret = new kubernetes.apiextensions.CustomResource(
      key,
      {
        apiVersion: 'secrets-store.csi.x-k8s.io/v1alpha1',
        kind: 'SecretProviderClass',
        metadata: {
          name: `${serviceId}-secrets`,
        },
        spec: {
          provider: 'gcp',
          parameters: {
            secrets: toYamlOutput(
              pulumi.output([{ resourceName: gcpSecretVersion.id, fileName: 'store' }])
            ),
          },
        },
      },
      { provider: provider }
    );
    secrets[key] = k8sSecret;
  }
  return { k8sSecret: secrets[key] };
}

function getK8sSecret(args: {
  secretName: string;
  provider: K8sProvider;
  dependsOn: DependsOn;
}): kubernetes.core.v1.Secret {
  const { secretName, provider, dependsOn } = args;
  return kubernetes.core.v1.Secret.get(secretName, `${provider.namespace}/${secretName}`, {
    provider,
    dependsOn,
  });
}

export function getK8sSecretValue(args: {
  secretName: string;
  provider: K8sProvider;
  dependsOn: DependsOn;
}) {
  const { secretName, provider, dependsOn } = args;
  const secretData = getK8sSecret({ secretName, provider, dependsOn }).data;
  return secretData;
}
