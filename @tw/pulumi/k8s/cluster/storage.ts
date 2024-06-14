import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider } from '../provider';

export function createK8sStorageClasses(args: { provider: K8sProvider }) {
  new kubernetes.storage.v1.StorageClass(
    `pd-extreme-${args.provider.uuid}`,
    {
      metadata: {
        name: 'pd-extreme',
      },
      provisioner: 'pd.csi.storage.gke.io',
      reclaimPolicy: 'Delete',
      volumeBindingMode: 'WaitForFirstConsumer',
      parameters: {
        type: 'pd-extreme',
      },
      allowVolumeExpansion: true,
    },
    {
      provider: args.provider,
    }
  );
}
