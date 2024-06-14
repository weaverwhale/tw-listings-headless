import { isLocal, isStaging } from '@tw/constants';
import bunyan, { LoggerOptions, LogLevel } from 'bunyan';
import { tracer } from './datadog';
import { createTraceField, getStoreKey } from './twContext';
import { traceIdFieldName } from './constants';

const BUNYAN_TO_STACKDRIVER = {
  60: 'CRITICAL',
  50: 'ERROR',
  40: 'WARNING',
  30: 'INFO',
  20: 'DEBUG',
  10: 'DEBUG',
};

type BunyanLogRecord = {
  name: string;
  hostname: string;
  pid: number;
  level: number;
  msg: string;
  time: string;
  v: number;
};

type ThrottleArgs = {
  maxPerSecond?: number;
  maxBytesPerSecond?: number;
};

function decoratedStream(
  args: {
    throttleArgs?: ThrottleArgs;
  } = {}
): bunyan.WriteFn {
  const { throttleArgs } = args;
  let logCount = 0;
  let byteCount = 0;
  let throttled = false;
  let lastResetTime = Date.now();

  function throttle(log: BunyanLogRecord) {
    const now = Date.now();
    // reset every second
    if (now - lastResetTime > 1000) {
      if (throttled) {
        throttled = false;
        logger.warn('throttled logs');
      }
      lastResetTime = now;
      logCount = 0;
      byteCount = 0;
    }
    if (throttleArgs.maxPerSecond && logCount >= throttleArgs.maxPerSecond) {
      return true;
    }
    if (throttleArgs.maxBytesPerSecond && byteCount >= throttleArgs.maxBytesPerSecond) {
      return true;
    }
    logCount++;
    byteCount += Buffer.byteLength(JSON.stringify(log, bunyan.safeCycles()), 'utf8');
    return false;
  }

  return {
    write: (log: BunyanLogRecord) => {
      if (throttleArgs && throttle(log)) {
        throttled = true;
        return;
      }
      if (!process.env.IS_TEMPORAL_WORKER) {
        delete log.pid;
      }
      delete log.v;
      const logParams = getStoreKey('logParams');
      if (log.msg) {
        // gcp log viewer doesn't show msg
        log['message'] = log.msg;
      }
      delete log.msg;
      log['severity'] = BUNYAN_TO_STACKDRIVER[log.level];
      delete log.level;
      const decoratedLog = {
        ...logParams,
        ...log,
      };
      if (!decoratedLog[traceIdFieldName] && decoratedLog['traceId']) {
        decoratedLog[traceIdFieldName] = createTraceField(decoratedLog['traceId']);
      }
      if (isLocal) {
        return localLog(decoratedLog);
      }
      const newLog = JSON.stringify(decoratedLog, bunyan.safeCycles());
      console.log(newLog);
    },
  };
}

function localLog(log: any) {
  const args = [];
  const msg = log.message;
  if (msg) args.push(msg);
  const method = log.level === 50 ? 'error' : 'log';
  delete log.name;
  delete log.hostname;
  delete log.message;
  delete log.time;
  delete log.severity;
  delete log['logging.googleapis.com/trace'];
  if (Object.keys(log).length) {
    args.push(JSON.stringify(log, null, 2));
  }
  return console[method](...args);
}

export function getLogger(args?: {
  options?: Omit<LoggerOptions, 'name'>;
  throttleArgs?: ThrottleArgs;
}): bunyan {
  let { options = {}, throttleArgs } = args || {};
  let { level, name = process.env.SERVICE_ID || 'none' } = options as LoggerOptions;
  if (!throttleArgs && process.env.LOG_THROTTLE) {
    try {
      throttleArgs = JSON.parse(process.env.LOG_THROTTLE);
    } catch (e) {
      console.error('failed to parse LOG_THROTTLE');
    }
  }
  level = level || (process.env.LOG_LEVEL as LogLevel);
  if (!level) {
    if (isLocal) {
      level = 'trace';
    } else if (isStaging) {
      level = 'debug';
    } else {
      level = 'info';
    }
  }
  const streams: bunyan.Stream[] = [{ type: 'raw', stream: decoratedStream({ throttleArgs }) }];
  const logger = bunyan.createLogger({
    streams,
    ...options,
    level,
    name,
    serializers: { err: bunyan.stdSerializers.err },
  });
  return logger;
}

export function setLogContext(logContext: Record<string, any>, args?: { addToDD?: boolean }) {
  const logParams = getStoreKey('logParams');
  Object.assign(logParams, logContext);
  const parentLogParams = getStoreKey('context').parentLogParams;
  if (parentLogParams) {
    Object.assign(parentLogParams, logContext);
  }
  if (args?.addToDD && tracer) {
    tracer.scope().active().addTags(logContext);
  }
}

export const logger: bunyan = getLogger();

export type Bunyan = bunyan;

export { LoggerOptions, LogLevel, LogLevelString } from 'bunyan';
