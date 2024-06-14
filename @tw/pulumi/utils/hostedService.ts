import * as gcp from '@pulumi/gcp';
import { createSecret } from '../secrets';
import { getConfigs } from './getConfigs';
import { toJSONOutput } from '../pulumi-utils';

export function storeHostedServiceInfo(args: {
  type: 'rabbitmq' | 'clickhouse' | 'kafka';
  name: string;
  data: any;
}) {
  const { type, name, data } = args;
  const { projectId } = getConfigs();
  createSecret(data, `${name}-${type}`);

  new gcp.storage.BucketObject(`${name}-${type}`, {
    bucket: `devops-${projectId}`,
    content: toJSONOutput(data),
    name: `hosted-service/${type}/${name}.json`,
  });
}
