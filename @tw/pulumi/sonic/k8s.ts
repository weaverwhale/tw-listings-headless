import { PodTemplateArgs } from '../k8s';
import { monitoringState } from '../monitoring/state';
import { convertEnvs } from '../utils/helpers';

export type SaberArgs = {
  saberPipelines?: string[];
  main?: string;
  concurrencyLimit?: number;
  concurrencyTarget?: number;
};

export function createSaberK8sPodArgs(args: SaberArgs) {
  monitoringState.saber.enabled = true;
  const cmdArgs = args.saberPipelines?.map((v) => `--pipeline=${v}`) || [];
  if (args.main) {
    cmdArgs.push(`--main=${args.main}`);
  }
  const podArgs: PodTemplateArgs = {
    allowSpot: true,
    memoryRequest: '2Gi',
    CPURequest: 1,
    args: cmdArgs.length ? cmdArgs : undefined,
    ports: [],
    envs: convertEnvs({
      IS_SABER: '1',
      TW_ENTRY: 'node_modules/@tw/saber/module/saber.js',
      SABER_MAX_PARALLEL: args.concurrencyLimit ? String(args.concurrencyLimit) : undefined,
      LOG_THROTTLE: JSON.stringify({
        maxPerSecond: 50,
        maxBytesPerSecond: 1024 * 50, // 50KB
      }),
      // 10 minutes
      TW_OUTBOUND_REQUEST_TIMEOUT_MS: '600000',
    }),
    otel: true,
  };
  return podArgs;
}
