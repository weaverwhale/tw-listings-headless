import { FlowControlOptions } from '@tw/pubsub/build/src/lease-manager';
import { serviceId } from '@tw/constants';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { logger } from '../logger';
import { pullPubSubMessages } from '../pubsub';

export async function pubsubPullToPush(args: {
  subscriptions: { id: string; flowControl: FlowControlOptions; endpoint: string }[];
}) {
  const { subscriptions } = args;
  for (const subscription of subscriptions) {
    try {
      await pullPubSubMessages(
        subscription.id,
        async (message) => {
          try {
            logger.info(message.id);
            let payload = Buffer.from(message.data).toString();
            try {
              payload = JSON.parse(payload);
            } catch {}
            await callServiceEndpoint(
              serviceId,
              subscription.endpoint,
              { data: payload },
              {
                method: 'POST',
              }
            );
            message.ack();
          } catch (e) {
            logger.error(e);
            message.nack();
          }
        },
        {
          forceCloud: true,
          subscriptionOptions: { flowControl: subscription.flowControl },
        }
      );
    } catch (e) {
      logger.error('failed pull', e);
    }
  }
}
