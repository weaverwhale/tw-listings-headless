import { tracer } from './tracing';

export function addErrorMessageToDatadog(error: Error) {
  if (tracer) {
    try {
      tracer.scope().active().setTag('error.message', error.message);
      tracer.scope().active().setTag('error.stack', error.stack);
    } catch {}
  }
}
