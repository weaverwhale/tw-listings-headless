import { callPubSub, pullPubSubMessages } from '@tw/utils/module/pubsub';
import { callServiceEndpoint } from '@tw/utils/module/callServiceEndpoint';
import { cliLog, cliSuccess, cliError } from '../../utils/logs';
import { PubSub } from '@tw/pubsub';
import { cliConfig } from '../../config';
import { getGcloudUserEmail } from '@tw/devops';

export async function pullFromPubsub(argv) {
  const pubsub = new PubSub();
  const author = getGcloudUserEmail().replace('@', '-at-').replace('.', '-dot-');
  const topicName = argv.topic;
  const subscriptionName = `${topicName}-${author}`;
  const topic = pubsub.topic(topicName);
  const [subscriptions] = await topic.getSubscriptions();
  const log = !Boolean(argv.k);
  const exists = subscriptions.find((subscription) =>
    subscription.name.endsWith(subscriptionName)
  )?.name;
  if (exists) {
    log && cliSuccess(`Using subscription ${subscriptionName}`);
  } else {
    log && cliLog(`Creating subscription...`);
    const [sub] = await topic.createSubscription(subscriptionName, {
      ackDeadlineSeconds: 600,
      expirationPolicy: {
        ttl: { seconds: 3600 * 24 * 1 },
      },
      messageRetentionDuration: {
        seconds: 3600,
      },
    });
    log && cliSuccess(`Created subscription ${subscriptionName}`);
  }
  if (argv.k) {
    console.log(subscriptionName);
    return;
  }
  const serviceId = argv.service as string;
  const endpoint = argv.endpoint as string;

  await pullPubSubMessages(
    subscriptionName,
    async (message) => {
      cliLog(`got message ${message.id}`);
      if (serviceId && endpoint) {
        try {
          await callServiceEndpoint<any[], any>(
            serviceId,
            endpoint + (endpoint.includes('?') ? '&' : '?') + 'isPubsub=true',
            {
              message: {
                data: Buffer.from(message.data).toString('base64'),
                attributes: message.attributes,
                messageId: message.id,
              },
            },
            {
              method: 'POST',
            }
          );
        } catch (e) {
          cliError(`Error: ${e}`);
          message.nack();
        }
      } else if (argv.l) {
        await callPubSub(argv.t, JSON.parse(message.data.toString()), message.attributes);
      } else {
        console.log(Buffer.from(message.data).toString());
      }
      message.ack();
    },
    {
      forceCloud: true,
      subscriptionOptions: { flowControl: { maxMessages: 1 } },
      projectId: cliConfig.projectId,
    }
  );
}
