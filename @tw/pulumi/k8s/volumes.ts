import * as gcp from '@pulumi/gcp';
import * as kubernetes from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { K8sProvider } from './provider';

// NOTE, if we set k8s names, pulumi - on replace will always try to delete first and then create,
// which will always fail, because theres a pod still mounting the volume. this is why i let pulumi auto generate the names

export function createReadOnlyManyVolumeFromDisk(args: {
  name: string;
  disk: gcp.compute.Disk;
  provider: K8sProvider;
}) {
  const { name, disk, provider } = args;
  const size = pulumi.interpolate`${disk.size}G`;
  const persistentVolume = new kubernetes.core.v1.PersistentVolume(
    name,
    {
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      spec: {
        storageClassName: name,
        capacity: {
          storage: size,
        },
        accessModes: ['ReadOnlyMany'],
        csi: {
          driver: 'pd.csi.storage.gke.io',
          volumeHandle: disk.id,
          readOnly: true,
        },
      },
    },
    { provider }
  );
  const persistentVolumeClaim = new kubernetes.core.v1.PersistentVolumeClaim(
    name,
    {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        labels: {
          'triplewhale.com/disk-zone': disk.zone,
        },
      },
      spec: {
        storageClassName: persistentVolume.spec.storageClassName,
        volumeName: persistentVolume.metadata.name,
        accessModes: ['ReadOnlyMany'],
        resources: {
          requests: {
            storage: size,
          },
        },
      },
    },
    { provider }
  );
  return { persistentVolume, persistentVolumeClaim };
}
