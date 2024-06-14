import { BigQuery, Query } from '@google-cloud/bigquery';
import * as crypto from 'crypto';
import { getStoreKey } from '../twContext';
import { isProd, projectId, serviceId, isLocal } from '@tw/constants';
import { addErrorMessageToDatadog, safeActivateSpan, submitDDMetrics, tracer } from '../datadog';
import type { Span } from 'dd-trace';
import { logger } from '../logger';
import { Timer } from '../clock';
import { callPubSub } from '../callPubSub';
import {
  calculateAppComponent,
  calculateBiEngineMode,
  calculateEstimatedMaxSlots,
  calculateQueryTimes,
  calculateShuffleOutputBytes,
  getReferencedTables,
} from './utils';

const clients: Record<string, BigQuery> = {};

const bqResourceProject = isProd && !isLocal ? 'triplewhale-dataland' : projectId;

if (tracer) {
  tracer.use('http', {
    hooks: {
      request: (span, _req) => {
        const service = tracer.scope().active()?.getBaggageItem('service.name');
        if (service) span.setTag('service.name', service);
      },
    },
  });
}

export function getBQClient(args: { projectId?: string } = {}) {
  const { projectId = bqResourceProject } = args;
  if (clients[projectId]) return clients[projectId];
  const bigquery = new BigQuery({ projectId });
  clients[projectId] = bigquery;
  bigquery.query = (async (...args) => {
    let span: Span;
    const context = getStoreKey('context');
    const logParams = getStoreKey('logParams');
    const resourceName = context.req?.route?.path || logParams.wsEventName;
    let referer;
    if (context.req?.headers?.referer) {
      referer = new URL(context.req.headers.referer).pathname;
    }
    const appComponent = calculateAppComponent(referer);
    const jobTimeoutMs = context.uf ? 1000 * 60 * 2 : undefined;
    const shopId = logParams.shopId
      ? logParams.shopId.split('.myshopify.com')[0].replaceAll('.', '-').toLowerCase().slice(0, 62)
      : 'unknown';
    let options: Query = {
      jobTimeoutMs,
      labels: {
        'shop-id': shopId,
      },
    };
    if (typeof args[0] === 'string') {
      options = {
        ...options,
        query: args[0],
        ...args[1],
      };
    } else {
      options = {
        ...options,
        ...args[0],
      };
    }

    if (tracer) {
      span = tracer.startSpan('bq.job', {
        childOf: tracer.scope().active(),
        tags: {
          'resource.name': resourceName || 'bq.job',
          'service.name': `${serviceId}-bq`,
          'tw.shopId': logParams.shopId,
          'tw.traceId': context.traceId,
          'tw.userId': logParams.userId,
          'tw.referer': referer,
          'tw.appComponent': appComponent,
          'bq.bq_project_id': projectId,
          component: 'bq',
        },
      });
      span.setBaggageItem('service.name', `${serviceId}-bq`);
    }
    return safeActivateSpan(span, async () => {
      let jobId;
      const timer = new Timer();
      let success = true;
      try {
        timer.start();
        const [job] = await bigquery.createQueryJob(options);
        jobId = job.id;
        const [res] = await job.getQueryResults();
        timer.end();
        return [res, job];
      } catch (e) {
        success = false;
        jobId = e.response?.jobReference?.jobId;
        if (tracer) {
          addErrorMessageToDatadog(e);
        }
        logger.error(e);
        throw e;
      } finally {
        bigquery
          .job(jobId)
          .getMetadata()
          .then((metadata) => {
            // https://cloud.google.com/bigquery/docs/reference/rest/v2/Job
            try {
              if (span) {
                const statistics = metadata[0].statistics || {};
                const query = statistics.query || {};
                const shuffleOutputBytes = calculateShuffleOutputBytes(query);
                const tablesAsList = getReferencedTables(query);
                const tables = tablesAsList.join(':');
                const cacheHit = query.cacheHit || false;
                const biEngineMode = calculateBiEngineMode(statistics?.query);
                const uf = String(context.uf);
                const ddTags = {
                  bq_project_id: projectId,
                  resource_name: resourceName,
                  cache_hit: cacheHit,
                  tables: crypto.createHash('md5').update(tables).digest('hex'),
                  success: String(success),
                  biEngineMode,
                  uf,
                  referer,
                  appComponent,
                };
                span.setTag('bq.uf', uf);
                span.setTag('bq.jobId', jobId);
                span.setTag('bq.tables', tables);
                span.setTag('bq.cache_hit', String(cacheHit));
                span.setTag('bq.success', success);
                span.setTag('bq.bi_engine_mode', biEngineMode);
                span.setTag(
                  'tw.jobMetadata',
                  `http://devops.srv.whale3.io/bq/job?projectId=${projectId}&jobId=${jobId}`
                );
                span.setTag(
                  'tw.jobInfo',
                  `https://console.cloud.google.com/bigquery?project=${projectId}&j=bq:US:${jobId}&page=queryresults`
                );
                const { ghostTime, totalTime, queueTime, finalExecutionTime } =
                  calculateQueryTimes(statistics);
                const twTotalTime = timer.elapsed().ms;
                const increments = {
                  'bq.jobs': 1,
                  'bq.total_bytes_processed': statistics.totalBytesProcessed || 0,
                  'bq.estimated_max_slots': calculateEstimatedMaxSlots(query),
                  'bq.tw_total_time_ms': twTotalTime,
                  'bq.total_slot_ms': statistics.totalSlotMs,
                  'bq.ghost_time_ms': ghostTime,
                  'bq.total_time_ms': totalTime,
                  'bq.final_execution_duration_ms': finalExecutionTime,
                  'bq.queued_time_ms': queueTime,
                  'bq.shuffle_output_bytes': shuffleOutputBytes,
                };
                submitDDMetrics({
                  metrics: increments,
                  metricType: 'increment',
                  tags: ddTags,
                });
                if (!isLocal)
                  callPubSub(
                    'bigquery-job-stats',
                    {
                      shopId: logParams.shopId,
                      userId: logParams.userId,
                      userEmail: context.req?.user?.email || context.socket?.user?.email,
                      jobId,
                      traceId: context.traceId,
                      resourceName,
                      bqProjectId: projectId,
                      serviceId,
                      uf: context.uf,
                      referer,
                      twTotalTime,
                      success,
                    },
                    {},
                    { batching: { maxMessages: 100, maxMilliseconds: 10 * 1000 } }
                  ).catch((e) => {
                    logger.error(e);
                  });
                span.finish();
              }
            } catch (e) {
              logger.error(e);
              if (span) span.finish();
            }
          })
          .catch(() => {});
      }
    });
  }) as any;
  return bigquery;
}
