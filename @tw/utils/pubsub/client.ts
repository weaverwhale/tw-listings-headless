import { PubSub, ClientConfig } from '@tw/pubsub';
import { isLocal } from '@tw/constants';

const pubsubClients: Record<string, PubSub> = {};

export function getPubSubClient(opts?: {
  forceCloud?: boolean;
  new?: boolean;
  projectId?: string;
}) {
  const { projectId = process.env.GCLOUD_PROJECT } = opts || {};
  const forceCloud = opts.forceCloud || process.env.FORCE_CLOUD === 'true';
  const key = forceCloud ? 'forceCloud' : 'plain';
  if (!pubsubClients[key] || opts.new) {
    const options: ClientConfig = {
      projectId,
    };
    if (isLocal && !forceCloud) options.apiEndpoint = 'http://localhost:8065';
    pubsubClients[key] = new PubSub(options);
  }
  return pubsubClients[key];
}
