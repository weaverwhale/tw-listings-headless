import { createKafkaTopic } from '../kafka';
import { createTemporalSchedule } from '../temporal';
import { getConfigs } from '../utils';
import { ClickhousePipelineArgs } from './pipeline';
import { ScheduleOverlapPolicy } from '@temporalio/client';
import { createClickhouseTable } from './table';
import { getPartitionBies } from './utils';

export function createLevel(args: {
  name: string;
  mode: 'LEVEL' | 'LEVEL_SPLIT';
  database: string;
  pipelineArgs: ClickhousePipelineArgs['pipelineArgs'];
  tableArgs: ClickhousePipelineArgs['tableArgs'];
}) {
  const { name, database, pipelineArgs, mode, tableArgs } = args;
  const { projectId } = getConfigs();

  const { splitNumDays, interval = '5 minutes', streamEngine } = pipelineArgs;
  const {
    metadata,
    columns,
    engine,
    engineParams,
    indices,
    orderBies,
    settings,
    comment,
    protect,
    cluster,
  } = tableArgs;

  if (streamEngine !== 'saber') {
    throw new Error('Only saber stream engine is supported for level pipelines');
  }

  const tableName = name.replace(/-/g, '_');

  const partitionBies = getPartitionBies({
    metadata: {
      dateField: metadata.dateField,
    },
    columns,
  });

  if (mode === 'LEVEL_SPLIT') {
    createClickhouseTable({
      name: `${tableName}__live`,
      database,
      cluster,
      engine,
      engineParams,
      indices,
      orderBies,
      partitionBies,
      metadata,
      columns,
      settings,
      comment,
      protect,
    });
  }

  createKafkaTopic({ name });

  createTemporalSchedule(name, {
    projectId,
    serviceId: 'clickhouse-ops',
    namespace: 'clickhouse-ops-ns',
    scheduleId: name,
    spec: {
      intervals: [{ every: interval }],
    },
    action: {
      type: 'startWorkflow',
      workflowType: 'optimizeFull',
      taskQueue: 'queue',
      args: [
        {
          table: tableName,
          database,
          splitNumDays,
        },
      ],
      searchAttributes: {
        merge_table: [tableName], // 'table' is reserved
      },
    },
    policies: { overlap: ScheduleOverlapPolicy.BUFFER_ONE },
  });
}
