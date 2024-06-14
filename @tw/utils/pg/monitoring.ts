import { submitDDMetrics, tracer } from '../datadog';
import { pools } from './pool';

export function monitorPGPools() {
  if (tracer) {
    setInterval(() => {
      const data = Object.entries(pools).map(([k, v]) => {
        const metrics = {
          'pg.pool_total_count': v.totalCount,
          'pg.pool_idle_count': v.idleCount,
          'pg.pool_waiting_count': v.waitingCount,
        };
        const tags = {
          pg_host: k,
          // @ts-ignore
          pg_name: v.name || k,
        };
        return { metrics, tags };
      });
      for (const { metrics, tags } of data) {
        submitDDMetrics({
          metrics,
          metricType: 'gauge',
          tags,
        });
      }
    }, 10000);
  }
}
