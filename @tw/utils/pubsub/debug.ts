import { projectId } from '@tw/constants';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { logger } from '../logger';
import { callPubSub } from './send';
import { getStorageClient } from '../gcs/client';
import type { NextFunction, Request, Response, PubsubPushReqBody, PubsubRequest } from '../express';
import type { Message } from '@tw/pubsub';

export const DEBUG_STORAGE_BUCKET = `message-debug-${projectId}`;

export interface RequestWithPubsubDebug extends PubsubRequest {
  debug: () => Promise<void>;
}

export function debugPubsubMiddleware(topicName: string) {
  return async function _debugPubsubMiddleware(req: Request, res: Response, next: NextFunction) {
    const message = req.body;
    (req as any).debug = async function () {
      return await debugPubsubMessage(topicName, message);
    };
    next();
  };
}

type DebugPubsubOptions = {
  throw?: boolean;
  keepTrace?: boolean;
};

export async function debugPubsubMessage(
  topicName: string,
  message: PubsubPushReqBody,
  options: { throw?: boolean } = {}
): Promise<void> {
  try {
    const response = await callPubSub(
      'pubsub-save-debug',
      { ...message, topicName },
      {},
      { forceCloud: true }
    );
  } catch (e) {
    logger.error(`Error sending message to debug topic: ${e.message}`);
    if (options.throw) {
      throw e;
    }
  }
}

type PubsubDelivery = {
  subscription: string;
  message: Message;
};

export async function replayMessagesToPubSub({
  bucketName,
  topicName,
  filter,
  folderName,
  options = {},
}: {
  bucketName: string;
  topicName?: string;
  filter?: (message: any) => boolean;
  folderName?: string;
  options?: DebugPubsubOptions;
}): Promise<void> {
  async function replayPublishMessage(file: PubsubDelivery) {
    const { subscription, message } = file;
    if (!filter || filter(message)) {
      topicName = topicName || message.attributes?.topicName;
      if (!options.keepTrace) {
        delete message.attributes?.traceId;
      }
      message.attributes = {
        ...message.attributes,
        isReplay: 'true',
      };
      await callPubSub(topicName, message.data, message.attributes);
    }
  }
  return await streamMessagesFromBucket({
    bucketName,
    topicName,
    options,
    folderName,
    callback: replayPublishMessage,
  });
}

// prefer replayMessagesToPubSub when possible over this, to emulate actual behavior
export async function replayMessagesToEndpoint({
  bucketName,
  topicName,
  folderName,
  serviceId,
  endpoint,
  filter,
  options = {},
}: {
  bucketName: string;
  topicName?: string;
  folderName?: string;
  serviceId: string;
  endpoint: string;
  filter?: (message: any) => boolean;
  options?: DebugPubsubOptions;
}) {
  async function callEndpoint(file: PubsubDelivery) {
    const { subscription, message } = file;
    if (!filter || filter(message)) {
      // prefer this if you're using this function!
      if (endpoint.endsWith('isPubsub=true')) {
        if (!options.keepTrace) {
          delete message.attributes?.traceId;
        }
        message.attributes = {
          ...message.attributes,
          isReplay: 'true',
        };
        await callServiceEndpoint(
          serviceId,
          endpoint,
          {
            subscription,
            message: {
              ...message,
              data: Buffer.from(JSON.stringify(message.data)).toString('base64'),
            },
          },
          { forceCloud: true }
        );
      } else {
        await callServiceEndpoint(
          serviceId,
          endpoint,
          { subscription, ...message },
          { forceCloud: true }
        );
      }
    }
  }
  return await streamMessagesFromBucket({
    bucketName,
    folderName,
    topicName,
    options,
    callback: callEndpoint,
  });
}

async function streamMessagesFromBucket({
  bucketName,
  topicName,
  folderName,
  options = {},
  callback,
}: {
  bucketName: string;
  topicName: string;
  folderName?: string;
  options?: DebugPubsubOptions;
  callback: (message: any) => void | Promise<void>;
}) {
  try {
    const client = getStorageClient({ forceCloud: true });
    const bucket = (
      await client.getBuckets({ project: projectId, prefix: bucketName, maxResults: 1 })
    )[0][0];
    const stream = bucket.getFilesStream({ prefix: folderName || topicName });
    stream.on('data', async (file) => {
      let fileContents = (await file.download()).toString();
      let message: any;
      try {
        message = JSON.parse(fileContents);
      } catch (e) {
        logger.error(`Error parsing file content ${file.name}: ${e.message}`);
        return;
      }
      try {
        await callback(message);
      } catch (e) {
        logger.error(`Error processing message ${file.name}: ${e.message}`);
        if (options.throw) {
          this.close();
          throw e;
        }
        return;
      }
      await file.delete();
    });
    stream.on('error', (err) => {
      this.close();
      throw err;
    });
    stream.on('end', () => {
      logger.info(`Finished replaying messages from topic ${topicName}`);
    });
  } catch (e) {
    logger.error(`Error replaying messages from topic ${topicName}: ${e.message}`);
    if (options.throw) {
      throw e;
    }
  }
}
