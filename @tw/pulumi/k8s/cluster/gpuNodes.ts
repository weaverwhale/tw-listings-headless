import { K8sProvider } from '../provider';
import { allNodeLocations, createNodePool } from './nodePool';

export function createGpuNodes(args: { provider: K8sProvider }) {
  const { provider } = args;
  const gpus: {
    machineType: string;
    gpuType: string;
    locations?: string[];
  }[] = [
    {
      machineType: 'a2-highgpu-1g',
      gpuType: 'nvidia-tesla-a100',
      locations: allNodeLocations,
    },
    {
      machineType: 'n1-standard-4',
      gpuType: 'nvidia-tesla-v100',
      locations: allNodeLocations,
    },
    {
      machineType: 'g2-standard-4',
      gpuType: 'nvidia-l4',
      locations: allNodeLocations.filter((l) => l !== 'us-central1-f'),
    },
  ];

  gpus.forEach((gpu) => {
    const opts = {
      provider,
      machineType: gpu.machineType,
      nodeLocations: gpu.locations,
      guestAccelerators: [
        {
          type: gpu.gpuType,
          count: 1,
        },
      ],
      spot: true,
    };
    createNodePool(opts);
    createNodePool({ ...opts, spot: false });
  });
}
