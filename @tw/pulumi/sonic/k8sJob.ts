import { deepMerge } from '@tw/helpers';
import { K8sJobArgs, createK8sJobConfig, getK8sProvider } from '../k8s';
import { SaberArgs, createSaberK8sPodArgs } from './k8s';

export function createSaberK8sJobConfig(args: K8sJobArgs & SaberArgs) {
  const base: Partial<K8sJobArgs> = {
    podArgs: createSaberK8sPodArgs(args),
    name: 'saber',
  };
  const opts = deepMerge(base, args) as K8sJobArgs;
  return createK8sJobConfig({
    ...opts,
    provider: getK8sProvider({ cluster: 'pipelines-cluster' }),
  });
}
