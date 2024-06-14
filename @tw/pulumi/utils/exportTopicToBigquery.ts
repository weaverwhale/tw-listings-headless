import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { isStaging } from '../constants';
import { createLabels } from './createLabels';
import { getConfigs } from './getConfigs';
import { getPubsubTopicId } from './getResourceId';

export function exportTopicToBigquery(args: {
  topicName: pulumi.Input<string>;
  name: string;
  tableArgs?: Partial<gcp.bigquery.TableArgs>;
  datasetId?: string;
  useTopicSchema?: boolean;
  customSchema?: any[];
  protectTable?: boolean;
  deployToStg?: boolean;
}) {
  const { projectId, serviceId } = getConfigs();
  const {
    topicName,
    name,
    tableArgs,
    customSchema = [],
    datasetId = 'etl_staging',
    useTopicSchema = false,
    protectTable = true,
    deployToStg = false,
  } = args || {};

  if (isStaging && !deployToStg) return;

  const schema = [...bigqueryBaseSchema, ...customSchema];

  const bigQueryTable = new gcp.bigquery.Table(
    `${name}-bq-table`,
    {
      datasetId,
      tableId: name,
      timePartitioning: {
        type: 'HOUR',
        field: 'publish_time',
        expirationMs: 12960000000,
      },
      labels: {
        ...createLabels(),
      },
      schema: JSON.stringify(schema),
      ...tableArgs,
    },
    { protect: protectTable }
  );

  new gcp.pubsub.Subscription(`${name}-bq-export-sub`, {
    topic: topicName,
    bigqueryConfig: {
      table: pulumi.interpolate`${projectId}:${bigQueryTable.datasetId}.${bigQueryTable.tableId}`,
      dropUnknownFields: true,
      useTopicSchema,
      writeMetadata: true,
    },
    deadLetterPolicy: {
      deadLetterTopic: getPubsubTopicId('message-graveyard'),
      maxDeliveryAttempts: 10,
    },
  });

  return { bigQueryTable };
}

export const bigqueryBaseSchema = [
  {
    name: 'subscription_name',
    type: 'STRING',
    mode: 'NULLABLE',
    description: 'metadata',
  },
  {
    name: 'message_id',
    type: 'STRING',
    mode: 'NULLABLE',
    description: 'metadata',
  },
  {
    name: 'publish_time',
    type: 'TIMESTAMP',
    mode: 'NULLABLE',
    description: 'metadata',
  },
  {
    name: 'data',
    type: 'JSON',
    mode: 'NULLABLE',
    description: 'metadata',
  },
  {
    name: 'attributes',
    type: 'STRING',
    mode: 'NULLABLE',
    description: 'metadata',
  },
];
