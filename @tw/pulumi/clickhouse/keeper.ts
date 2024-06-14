import * as kubernetes from '@pulumi/kubernetes';
import {
  K8sProvider,
  createNodePool,
  getSelectorsForNodePool,
  getSelectorsForPrivatePoolParty,
} from '../k8s';
import { createPrometheusMonitor } from '../prometheus/monitor';

const dirname = __dirname.replace('/pulumi/module/', '/pulumi/src/');

// https://clickhouse.com/docs/en/guides/sre/keeper/clickhouse-keeper

export function createClickhouseKeeper(args: {
  name: string;
  provider: K8sProvider;
  zones?: string[];
}) {
  const { name } = args;
  let provider = args.provider;

  const { tolerations, nodeSelector } = getSelectorsForPrivatePoolParty({
    friendlyName: `${name}-keeper`,
  });

  const keeper = new kubernetes.yaml.ConfigFile(
    `keeper-${name}-${provider.cluster_uuid}`,
    {
      file: `${dirname}/keeper.yaml`,
      resourcePrefix: `${name}-${provider.cluster_uuid}`,
      transformations: [
        (obj) => {
          if (obj.kind === 'StatefulSet') {
            obj.spec.template.spec.tolerations = tolerations;
            obj.spec.template.spec.nodeSelector = nodeSelector;
          }
        },
      ],
    },
    { provider, dependsOn: provider.dependsOn }
  );

  createPrometheusMonitor({
    kind: 'Pod',
    release: 'devops',
    name: 'clickhouse-keeper',
    provider,
    endpoints: [{ portName: 'metrics' }],
    labels: { app: 'clickhouse-keeper' },
  });

  return keeper;
}
