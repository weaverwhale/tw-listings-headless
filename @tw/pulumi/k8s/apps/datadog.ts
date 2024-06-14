import * as pulumi from '@pulumi/pulumi';
import { getSecretValue } from '../../secrets';
import { createHelmRelease } from '../helm';
import { K8sProvider } from '../provider';
import { getClusterRoot } from '../cluster/utils';

const dirname = getClusterRoot();

export function deployDatadog(args: { provider: K8sProvider; jmx?: boolean }) {
  const { provider, jmx } = args;
  const values = {
    datadog: { site: 'us5.datadoghq.com.', apiKey: getSecretValue('datadog-api-key') },
  };
  if (jmx) {
    values['agents'] = { image: { tagSuffix: 'jmx' } };
  }
  const datadogHelm = createHelmRelease({
    name: `datadog-${provider.cluster_uuid}`,
    releaseArgs: {
      chart: 'datadog',
      name: 'datadog-agent',
      namespace: 'datadog',
      createNamespace: true,
      valueYamlFiles: [new pulumi.asset.FileAsset(`${dirname}/helm/charts/datadog/values.yaml`)],
      values,
      repositoryOpts: {
        repo: 'https://helm.datadoghq.com',
      },
    },
    provider,
  });
  return { resources: [datadogHelm] };
}
