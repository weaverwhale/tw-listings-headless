import { tracer } from './tracing';
import { projectId } from '@tw/constants';
import type { Span } from 'dd-trace';

export async function submitDDMetrics(args: {
  metrics: Record<string, number>;
  metricType: 'increment' | 'decrement' | 'distribution' | 'gauge';
  tags?: { [tag: string]: string | number };
  span?: Span;
}) {
  const { metrics, metricType, span } = args;
  const tags = { project_id: projectId, ...args.tags };
  Object.keys(tags).forEach((key) => tags[key] === undefined && delete tags[key]);
  if (tracer) {
    for (const [stat, value] of Object.entries(metrics)) {
      tracer.dogstatsd[metricType](`tw.${stat}`, value, tags);
      if (span) {
        span.setTag(stat, String(value));
      }
    }
  }
}
