import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { isCanonicalStack } from './utils';
import { getUniqueNameInProject } from '../utils';
import { deadLetterTopicName } from './names';

const pbPushToBQ = [
  { name: 'ingest_time', type: 'TIMESTAMP', defaultValueExpression: 'CURRENT_TIMESTAMP()' },
  { name: 'subscription_name', type: 'STRING' },
  { name: 'message_id', type: 'STRING' },
  { name: 'publish_time', type: 'TIMESTAMP' },
  { name: 'data', type: 'JSON' },
  { name: 'attributes', type: 'JSON' },
];

export function mkDeadLetter(datasetId: pulumi.Input<string>) {
  const deadLetterTopic = new gcp.pubsub.Topic('dead-letter-topic', {
    name: deadLetterTopicName,
  });
  const graveTopic = new gcp.pubsub.Topic('grave-topic', {
    name: getUniqueNameInProject('dataland-grave-topic'),
  });

  const table = new gcp.bigquery.Table('dead-letter-table', {
    datasetId: datasetId,
    tableId: isCanonicalStack() ? 'dead-letter' : getUniqueNameInProject('dead-letter'),
    schema: JSON.stringify(pbPushToBQ),
    timePartitioning: {
      type: 'DAY',
      field: 'ingest_time',
    },
    requirePartitionFilter: true,
    clusterings: ['ingest_time'],
  });

  new gcp.pubsub.Subscription('dead-letter-subscription', {
    topic: deadLetterTopic.name,
    bigqueryConfig: {
      table: pulumi.interpolate`${new pulumi.Config('gcp').require('project')}:${datasetId}.${
        table.tableId
      }`,
      dropUnknownFields: true,
      writeMetadata: true,
    },
    deadLetterPolicy: {
      deadLetterTopic: graveTopic.id,
      maxDeliveryAttempts: 5,
    },
  });
}
