import { ServiceConfig } from '@tw/types';
import { exit } from 'process';
import { k8sCpuToNumber } from '../k8s/utils';
import { K8sCPU } from '../k8s';

export function pythonWorkers(args: {
  cpu: K8sCPU;
  concurrency: number;
  serviceConfig: ServiceConfig;
  workers?: number;
}) {
  const { cpu, concurrency, serviceConfig } = args;
  if (serviceConfig.runtime !== 'python') return { concurrency };
  const cpuNum = k8sCpuToNumber(cpu);
  let workers;
  if (serviceConfig.env?.WEB_CONCURRENCY) {
    workers = serviceConfig.env.WEB_CONCURRENCY;
  } else {
    workers = args.workers || cpuNum * 2 + 1;
    if (concurrency > 0) {
      workers = Math.min(workers, concurrency);
    }
  }
  workers = Math.round(workers);
  if (concurrency && concurrency / workers >= 2) {
    console.warn(
      `WEB_CONCURRENCY is set to ${workers} but concurrency is set to ${concurrency}. This may cause performance issues.`
    );
    exit(1);
  }
  return { workers, concurrency: concurrency ?? workers };
}
