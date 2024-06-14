import { callPubSub } from '../callPubSub';

export async function sendToWarehouse<T = any>(args: {
  topicName: string;
  payload: T;
  attributes?: Record<string, string>;
}) {
  const { topicName, payload, attributes } = args || {};
  return await callPubSub(topicName, payload, attributes);
}
