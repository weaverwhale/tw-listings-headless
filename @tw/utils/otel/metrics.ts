import os from 'os';
import opentelemetry from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { projectId, serviceId, isStaging } from '@tw/constants';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';
import { CounterInstrument } from '@opentelemetry/sdk-metrics/build/src/Instruments';
import { ObservableResultImpl } from '@opentelemetry/sdk-metrics/build/src/ObservableResult';

export const OTEL_URL = `http://${
  process.env.TW_OTEL_NODE === '1'
    ? process.env.K8S_HOST_IP
    : `${
        isStaging ? 'stg.' : ''
      }saber-otel.pipelines-cluster.us-central1.otel.internal.triplestack.io`
}`;

export let otelSDK: NodeSDK;

export function setupOtel() {
  const tags = {
    env: projectId,
    service: serviceId,
    'service.name': serviceId,
    version: process.env.TW_VERSION || '1.0.0',
    triplewhale_com_deployment: process.env.TW_DEPLOYMENT || process.env.USER,
    hostname: os.hostname(),
    'pulumi-stack': process.env.PULUMI_STACK_NAME,
    'pulumi-project': process.env.PULUMI_PROJECT_NAME,
  };

  const extendedAttributesFunctions = [
    {
      classObj: CounterInstrument,
      functionName: 'add',
      argIndex: 1,
    },
    {
      classObj: ObservableResultImpl,
      functionName: 'observe',
      argIndex: 1,
    },
  ];

  for (const { classObj, functionName, argIndex } of extendedAttributesFunctions) {
    const originalFunc = classObj.prototype[functionName];

    classObj.prototype[functionName] = function (...args) {
      args[argIndex] = { ...args[argIndex], ...tags };
      return originalFunc.call(this, ...args);
    };
  }

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: OTEL_URL + ':4317/v1/metrics',
    }),
    exportIntervalMillis: 5000,
    exportTimeoutMillis: 4000,
  });

  const traceExporter = new OTLPTraceExporter({ url: OTEL_URL + ':4317/v1/traces' });

  otelSDK = new NodeSDK({
    resource: new Resource(tags),
    traceExporter,
    metricReader,
    sampler: new TraceIdRatioBasedSampler(0.1),
  });
  otelSDK.start();
}

export function getOtelMeter(name: string = 'default') {
  return opentelemetry.metrics.getMeter(name);
}

export function getOtelTracer(name: string = 'default') {
  return opentelemetry.trace.getTracer(name);
}

export const otelTrace = opentelemetry.trace;
