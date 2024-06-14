import { Topic } from '@pulumi/gcp/pubsub';
import { getConfigs } from '../utils';
import type { CustomResourceOptions } from '@pulumi/pulumi';
import type { TopicArgs } from '@pulumi/gcp/pubsub';

export function createTopic(name: string, args?: TopicArgs, opts?: CustomResourceOptions) {
  const { projectId } = getConfigs();
  return new Topic(
    name,
    { name, ...args },
    opts || { aliases: [{ name: `${name}-${projectId}` }] }
  );
}
