import { serviceInfraConfig, deployTemporalWorker, createServiceAccount } from '@tw/pulumi';

const { serviceAccount } = createServiceAccount();

deployTemporalWorker({
  serviceAccount,
  createK8sDeploymentArgs: {
    podArgs: {
      memoryRequest: '1Gi',
      CPURequest: '500m',
    },
  },
});

serviceInfraConfig();
