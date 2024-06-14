import { DeployToK8sArgs, deployToK8s, getK8sProvider } from '../k8s';
import { getAlertEmails } from '../monitoring';
import { monitoringState } from '../monitoring/state';
import { deepMerge } from '@tw/helpers/module/deepMerge';

export function deployTemporalWorker(args: Omit<DeployToK8sArgs, 'providers'>) {
  monitoringState.temporal.enabled = true;
  const base: Partial<DeployToK8sArgs> = {
    createK8sDeploymentArgs: {
      podArgs: {
        labels: {
          'triplewhale.com/worker': 'temporal',
        },
        allowSpot: true,
        memoryRequest: '1Gi',
        otel: true,
      },
      averageMemoryUtilization: 80,
      averageCPUUtilization: 75,
      envs: {
        IS_TEMPORAL_WORKER: 'true',
        FETCHER_MAINTAINERS_EMAILS: getAlertEmails().toString(),
      },
    },
    providers: [getK8sProvider({ cluster: 'temporal-cluster' })],
  };

  const opts = deepMerge(base, args);

  return deployToK8s(opts);
}
