import * as pulumi from '@pulumi/pulumi';
import { createHelmRelease } from '../helm';
import { K8sProvider } from '../provider';
import { getClusterRoot } from '../cluster/utils';
import { createK8sIngress } from '../ingress';
import { TWDomain } from '../../utils';
import { projectIdAsSubDomain } from '@tw/constants';
import { createK8sService } from '../service';
import { deployToK8s } from '../helper';

const dirname = getClusterRoot();

export function deployAirbyte(args: { provider: K8sProvider; name: string }) {
  const { provider, name } = args;
  const airbyteHelm = createHelmRelease({
    name: `airbyte-${name}-${provider.uuid}`,
    releaseArgs: {
      chart: 'airbyte',
      name,
      namespace: provider.namespace,
      createNamespace: true,
      valueYamlFiles: [new pulumi.asset.FileAsset(`${dirname}/helm/charts/airbyte/values.yaml`)],
      repositoryOpts: {
        repo: 'https://airbytehq.github.io/helm-charts',
      },
    },
    provider,
  });

  createK8sIngress({
    name: `airbyte-${name}`,
    twDomain: new TWDomain('triplestack.io', `${name}.airbyte`, 'iap', projectIdAsSubDomain),
    selector: {
      'app.kubernetes.io/instance': name,
      'app.kubernetes.io/name': 'webapp',
    },
    ingressMode: 'iap',
    provider,
    dependsOn: [airbyteHelm],
  });

  createK8sService({
    name: `airbyte-${name}`,
    twDomain: new TWDomain('triplestack.io', `${name}.airbyte`, 'internal'),
    selector: {
      'app.kubernetes.io/instance': name,
      'app.kubernetes.io/name': 'airbyte-api-server',
    },
    ingressMode: 'internal',
    type: 'LoadBalancer',
    provider,
    ports: [{ targetPort: 8006, port: 80 }],
    dependsOn: [airbyteHelm],
  });

  deployToK8s({
    name: `airbyte-temporal-ui-${name}`,
    serviceAccount: null,
    createK8sDeploymentArgs: {
      podArgs: { image: 'temporalio/ui:2.17.0' },
      envs: {
        TEMPORAL_CSRF_COOKIE_INSECURE: 'true',
        TEMPORAL_ADDRESS: `${name}-temporal:7233`,
      },
      maxReplicas: 1,
    },
    providers: [provider],
    domain: new TWDomain('triplestack.io', `${name}.temporal-ui.airbyte`, 'internal'),
  });

  createK8sService({
    name: `airbyte-web-${name}`,
    twDomain: new TWDomain('triplestack.io', `${name}.web.airbyte`, 'internal'),
    selector: {
      'app.kubernetes.io/instance': name,
      'app.kubernetes.io/name': 'webapp',
    },
    ingressMode: 'internal',
    type: 'LoadBalancer',
    provider,
    ports: [{ targetPort: 8080, port: 80 }],
    dependsOn: [airbyteHelm],
  });

  return { resources: [airbyteHelm] };
}
