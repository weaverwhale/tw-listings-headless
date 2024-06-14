import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider, getK8sProvider } from '../provider';
import { k8sUniqueName } from '../utils';
import { createPodTemplate } from '../pod';
import { getServiceImage } from '../../utils';

export function deployMetadataProxy(args: { provider: K8sProvider }) {
  const { provider } = args;
  const defaultProvider = getK8sProvider({
    provider: provider,
    namespace: 'default',
  });

  const daemonSet = new kubernetes.apps.v1.DaemonSet(
    k8sUniqueName('metadata-proxy', provider),
    {
      metadata: {
        name: 'metadata-proxy',
        namespace: 'default',
      },
      spec: {
        selector: {
          matchLabels: {
            'app.kubernetes.io/part-of': 'metadata-proxy',
          },
        },
        template: createPodTemplate({
          hostNetwork: true,
          image: getServiceImage({ serviceId: 'metadata-proxy' }),
          appName: 'metadata-proxy',
          ports: [{ containerPort: 6382, hostPort: 6382 }],
          allowSpot: true,
          CPURequest: '20m',
          memoryRequest: '50Mi',
        }),
      },
    },
    { provider: defaultProvider }
  );
  return { resources: [daemonSet] };
}
