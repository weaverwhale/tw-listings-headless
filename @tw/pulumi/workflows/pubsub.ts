import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';
import { Step } from './schema/workflows';

export function sendPubSub(args: {
  name: string;
  topicName: pulumi.Input<string>;
  payload: {};
  attributes?: Record<string, string>;
}): {
  [k: string]: Step;
} {
  const { name, topicName, payload, attributes = {} } = args;
  const { projectId } = getConfigs();

  return {
    [name]: {
      try: {
        call: 'googleapis.pubsub.v1.projects.topics.publish',
        args: {
          topic: pulumi.interpolate`projects/${projectId}/topics/${topicName}`,
          body: {
            messages: [
              {
                data: Buffer.from(JSON.stringify(payload)).toString('base64'),
                attributes,
              },
            ],
          },
        },
      },
      retry: {
        predicate: '${http.default_retry_predicate}',
      },
    },
  };
}
