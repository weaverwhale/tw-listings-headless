import { type TracerOptions } from 'dd-trace';
import { loadDataDog } from '../datadog/tracing';

let wrapExpress = true;
let didInit = false;

export function initRuntime(
  args: {
    disableDataDog?: boolean;
    tracerOptions?: TracerOptions;
    monitorEventLoop?: boolean;
    expressAutoWrap?: boolean;
  } = {}
) {
  if (didInit) {
    return require('../datadog/tracing').tracer;
  }
  didInit = true;
  if (process.env.TW_DD && process.env.IS_LOCAL) {
    throw Error(
      'initRuntime must be the first import and the function must be called before the other imports!'
    );
  }
  const { tracerOptions, monitorEventLoop, expressAutoWrap = true, disableDataDog } = args;
  const tracer = loadDataDog({ tracerOptions, disableDataDog });
  require('../otel').setupOtel();
  if (monitorEventLoop) {
    eventLoopMonitor();
  }
  wrapExpress = expressAutoWrap;
  return { tracer };
}

import { Hook } from 'require-in-the-middle';
import { cacheable } from '../dns';
import { eventLoopMonitor } from '../performance/eventLoop';
import { endpointWrapper } from '../api/wrapper';

new Hook(['dns', 'express/lib/router/layer'], (exported: any, name) => {
  if (name === 'dns') {
    exported.lookup = cacheable.lookup;
    return exported;
  } else if (name === 'express/lib/router/layer') {
    if (!wrapExpress) {
      return exported;
    }
    const oldLayer = exported;
    const newLayer = function Layer(path, options, fn) {
      if (
        ['expressInit', 'wrapper', 'bound dispatch', 'router', 'query', 'corsMiddleware'].includes(
          fn.name
        ) ||
        fn.isMiddleware
      ) {
        return oldLayer(path, options, fn);
      }
      return oldLayer(path, options, endpointWrapper(fn));
    };
    newLayer.prototype = oldLayer.prototype;
    return newLayer;
  }
});
