import * as kubernetes from '@pulumi/kubernetes';
import { K8sProvider } from '../provider';

export function cuda(provider: K8sProvider) {
  const daemon = new kubernetes.apps.v1.DaemonSet(
    `cuda-${provider.cluster_uuid}`,
    {
      apiVersion: 'apps/v1',
      kind: 'DaemonSet',
      metadata: {
        name: 'nvidia-driver-installer',
        namespace: 'kube-system',
        labels: {
          'k8s-app': 'nvidia-driver-installer',
        },
      },
      spec: {
        selector: {
          matchLabels: {
            'k8s-app': 'nvidia-driver-installer',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        template: {
          metadata: {
            labels: {
              name: 'nvidia-driver-installer',
              'k8s-app': 'nvidia-driver-installer',
            },
          },
          spec: {
            priorityClassName: 'system-node-critical',
            affinity: {
              nodeAffinity: {
                requiredDuringSchedulingIgnoredDuringExecution: {
                  nodeSelectorTerms: [
                    {
                      matchExpressions: [
                        {
                          key: 'cloud.google.com/gke-accelerator',
                          operator: 'Exists',
                        },
                        {
                          key: 'cloud.google.com/gke-gpu-driver-version',
                          operator: 'DoesNotExist',
                        },
                      ],
                    },
                  ],
                },
              },
            },
            tolerations: [
              {
                operator: 'Exists',
              },
            ],
            hostNetwork: true,
            hostPID: true,
            volumes: [
              {
                name: 'dev',
                hostPath: {
                  path: '/dev',
                },
              },
              {
                name: 'vulkan-icd-mount',
                hostPath: {
                  path: '/home/kubernetes/bin/nvidia/vulkan/icd.d',
                },
              },
              {
                name: 'nvidia-install-dir-host',
                hostPath: {
                  path: '/home/kubernetes/bin/nvidia',
                },
              },
              {
                name: 'root-mount',
                hostPath: {
                  path: '/',
                },
              },
              {
                name: 'cos-tools',
                hostPath: {
                  path: '/var/lib/cos-tools',
                },
              },
              {
                name: 'nvidia-config',
                hostPath: {
                  path: '/etc/nvidia',
                },
              },
            ],
            initContainers: [
              {
                image: 'cos-nvidia-installer:fixed',
                imagePullPolicy: 'Never',
                name: 'nvidia-driver-installer',
                resources: {
                  requests: {
                    cpu: '150m',
                  },
                },
                securityContext: {
                  privileged: true,
                },
                env: [
                  {
                    name: 'NVIDIA_INSTALL_DIR_HOST',
                    value: '/home/kubernetes/bin/nvidia',
                  },
                  {
                    name: 'NVIDIA_INSTALL_DIR_CONTAINER',
                    value: '/usr/local/nvidia',
                  },
                  {
                    name: 'VULKAN_ICD_DIR_HOST',
                    value: '/home/kubernetes/bin/nvidia/vulkan/icd.d',
                  },
                  {
                    name: 'VULKAN_ICD_DIR_CONTAINER',
                    value: '/etc/vulkan/icd.d',
                  },
                  {
                    name: 'ROOT_MOUNT_DIR',
                    value: '/root',
                  },
                  {
                    name: 'COS_TOOLS_DIR_HOST',
                    value: '/var/lib/cos-tools',
                  },
                  {
                    name: 'COS_TOOLS_DIR_CONTAINER',
                    value: '/build/cos-tools',
                  },
                ],
                volumeMounts: [
                  {
                    name: 'nvidia-install-dir-host',
                    mountPath: '/usr/local/nvidia',
                  },
                  {
                    name: 'vulkan-icd-mount',
                    mountPath: '/etc/vulkan/icd.d',
                  },
                  {
                    name: 'dev',
                    mountPath: '/dev',
                  },
                  {
                    name: 'root-mount',
                    mountPath: '/root',
                  },
                  {
                    name: 'cos-tools',
                    mountPath: '/build/cos-tools',
                  },
                ],
                command: [
                  'bash',
                  '-c',
                  'echo "Checking for existing GPU driver modules"\nif lsmod | grep nvidia; then\n  echo "GPU driver is already installed, the installed version may or may not be the driver version being tried to install, skipping installation"\n  exit 0\nelse\n  echo "No GPU driver module detected, installting now"\n  /cos-gpu-installer install --version=latest\n  chmod 755 /root/home/kubernetes/bin/nvidia\nfi\n',
                ],
              },
              {
                image:
                  'gcr.io/gke-release/nvidia-partition-gpu@sha256:e226275da6c45816959fe43cde907ee9a85c6a2aa8a429418a4cadef8ecdb86a',
                name: 'partition-gpus',
                env: [
                  {
                    name: 'LD_LIBRARY_PATH',
                    value: '/usr/local/nvidia/lib64',
                  },
                ],
                resources: {
                  requests: {
                    cpu: '150m',
                  },
                },
                securityContext: {
                  privileged: true,
                },
                volumeMounts: [
                  {
                    name: 'nvidia-install-dir-host',
                    mountPath: '/usr/local/nvidia',
                  },
                  {
                    name: 'dev',
                    mountPath: '/dev',
                  },
                  {
                    name: 'nvidia-config',
                    mountPath: '/etc/nvidia',
                  },
                ],
              },
            ],
            containers: [
              {
                image: 'gcr.io/google-containers/pause:2.0',
                name: 'pause',
              },
            ],
          },
        },
      },
    },
    { provider }
  );
  return daemon;
}
