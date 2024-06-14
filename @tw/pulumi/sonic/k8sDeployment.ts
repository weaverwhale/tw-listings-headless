import { DeployToK8sArgs, createKedaPrometheusTrigger, deployToK8s, getK8sProvider } from '../k8s';
import { deepMerge } from '@tw/helpers/module/deepMerge';
import { SaberArgs, createSaberK8sPodArgs } from './k8s';
import { getConfigs } from '../utils';

export function deploySaber(args: DeployToK8sArgs & SaberArgs) {
  args.concurrencyLimit = args.concurrencyLimit || 5000;
  args.name = args.name || 'saber';
  const provider = getK8sProvider({ cluster: 'pipelines-cluster' });
  const { serviceId } = getConfigs();
  args.concurrencyTarget = args.concurrencyTarget ?? Number((args.concurrencyLimit / 5).toFixed(2));
  const kedaTriggers = args.createK8sDeploymentArgs?.kedaTriggers || [];
  if (args.concurrencyTarget) {
    kedaTriggers.push(
      createKedaPrometheusTrigger({
        threshold: String(args.concurrencyTarget),
        query: `sum by(service) (observability_saber_budget_usage_size{service="${serviceId}",triplewhale_com_deployment="${args.name}"})`,
      })
    );
  }
  const base: Partial<DeployToK8sArgs> = {
    ingresses: null,
    ports: [],
    providers: [provider],
    createK8sDeploymentArgs: {
      maxReplicas: 80,
      averageCPUUtilization: 65,
      scaleDownPolicies: [{ periodSeconds: 1, type: 'Percent', value: 1000 }],
      kedaTriggers,
      useKeda: true,
      podArgs: createSaberK8sPodArgs(args),
      datadogConfig: {
        profiling: true,
        sampleRate: 0.1,
      },
    },
  };

  const opts = deepMerge(base, args);
  return deployToK8s(opts);
}
