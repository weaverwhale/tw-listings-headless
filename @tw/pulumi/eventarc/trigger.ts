import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs, getPubsubTopicId, getWorkflowId } from '../utils';

// the service account must have roles/workflows.invoker
export function createTriggerFromTopicToWorkflow(args: {
  workflowName: pulumi.Input<string>;
  topicName: pulumi.Input<string>;
  serviceAccountEmail: pulumi.Input<string>;
  name?: string;
}) {
  const { workflowName, topicName, serviceAccountEmail, name = 'trigger' } = args;
  const { location } = getConfigs();
  const trigger = new gcp.eventarc.Trigger(name, {
    location,
    matchingCriterias: [
      {
        attribute: 'type',
        value: 'google.cloud.pubsub.topic.v1.messagePublished',
      },
    ],
    destination: {
      workflow: getWorkflowId(workflowName),
    },
    serviceAccount: serviceAccountEmail,
    transport: {
      pubsub: {
        topic: getPubsubTopicId(topicName),
      },
    },
  });

  return { trigger };
}
