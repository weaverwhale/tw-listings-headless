import type { TracerOptions, Tracer, Span } from 'dd-trace';
import { isK8s, isLocal, projectId, serviceId, isProd } from '@tw/constants/module/environments';

export let tracer: Tracer;

export function loadDataDog(
  args: { tracerOptions?: TracerOptions; disableDataDog?: boolean } = {}
) {
  let { tracerOptions = {}, disableDataDog } = args;
  const {
    profiling = isProd && !process.env.IS_SPOT ? true : false,
    runtimeMetrics = isProd && !process.env.IS_SPOT ? true : false,
  } = tracerOptions;
  const envOptions = process.env['TW_DD_CONFIG'];
  if (((isLocal || !isK8s) && !process.env.DD) || envOptions === '"false"' || disableDataDog) {
    console.log('not initing dd.');
    return;
  }
  tracer = require('dd-trace').tracer;

  let options: TracerOptions = {
    startupLogs: true,
    profiling,
    sampleRate: 1,
    flushInterval: 10000,
    logInjection: false,
    runtimeMetrics,
    env: projectId,
    service: serviceId,
    version: process.env.TW_VERSION || '1.0.0',
    tags: {
      triplewhale_com_deployment:
        process.env.TW_DEPLOYMENT || (isLocal ? process.env.USER : 'unknown'),
      'pulumi-stack': process.env.PULUMI_STACK_NAME,
      'pulumi-project': process.env.PULUMI_PROJECT_NAME,
      'tw.hostname': process.env.HOSTNAME || process.env.USER,
    },
  };

  if (envOptions) {
    try {
      options = { ...options, ...JSON.parse(envOptions) };
    } catch {}
  }
  if (tracerOptions) {
    options = { ...options, ...tracerOptions };
  }

  if (isLocal) console.log('initing dd with options: ', options);

  tracer.init(options);

  tracer.use('express', {
    blocklist: ['/ping'],
    middleware: false,
    hooks: {
      request: (span, req, res) => {
        span.addTags({
          'http.size': req?.socket?.bytesWritten,
        });
      },
    },
  });
  return tracer;
}

export function safeActivateSpan(span: Span, fn: (...args: any[]) => unknown) {
  if (span && tracer) {
    return tracer.scope().activate(span, fn);
  }
  return fn();
}
