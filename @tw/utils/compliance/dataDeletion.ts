import { compliance, serviceId } from '@tw/constants';
import { logger } from '../logger';
import { callPubSub } from '../callPubSub';
import { type Express, type Router, type Request, type Response } from '../express';
import { endpointWrapper } from '../api';

export type DataDeletionParams = { shopId: string; requestId: string; shopCreatedAt: Date };

export type ErrorResponse = {
  canBeRetried?: boolean;
  errorMessage?: string;
};

export type DataDeletionEndpointArgs = {
  endpoint?: string;
  handler: (args: DataDeletionParams) => Promise<string>;
  errorHandler?: (error: any, context: DataDeletionParams) => Promise<ErrorResponse>;
} & ({ router: Router; app?: never } | { app: Express; router?: never });

// To use:
//
// pass this function the router, the handler function, and optionally the errorHandler function
//
// * the handler function should return a string message on success (e.g. '173 Rows deleted successfully')
//
// * the errorHandler function should return an object with canBeRetried and errorMessage properties
//   - e.g. the shopId is somehow invalid, error can't be retried: { canBeRetried: false, errorMessage: 'Invalid shopId' }
//      - in this case, the pubsub subscription will not call the endpoint again, but the data deletion error topic will be called
//        and the message will be handled by the compliance service
//   - e.g. the shopId is valid, but the database is down, error can be retried: { canBeRetried: true, errorMessage: 'DB Connection error' }
//      - in this case, the pubsub subscription will call the endpoint on your service again
//   - note that `canBeRetried` defaults to true if not provided
export function createDataDeletionEndpoint(args: DataDeletionEndpointArgs) {
  async function _dataDeletionEndpoint(req: Request, res: Response) {
    const shopCreatedAt = new Date(req.body.data.shopCreatedAt);
    const payload = {
      ...req.body.data,
      shopCreatedAt,
    } as DataDeletionParams;
    await callDataDeletionBeginTopic(payload);
    let error: boolean = false;
    let successMessage: string;
    try {
      successMessage = await args.handler(payload);
      await callDataDeletionSuccessTopic(req.body as DataDeletionParams, successMessage);
      res.sendStatus(204);
    } catch (e: any) {
      const { canBeRetried = true, errorMessage = 'Error' } = args.errorHandler
        ? await args.errorHandler(e, payload)
        : { canBeRetried: true };
      logger.error({ err: e, canBeRetried, errorMessage }, 'Error deleting data');
      if (!canBeRetried) {
        await callDataDeletionFailureTopic(payload, errorMessage);
        res.sendStatus(204); // ACK -- won't retry
      } else {
        res.sendStatus(500); // NACK -- will retry
      }
    }
  }
  const router = args.router || args.app;
  router.post(args.endpoint || '/delete-data-request', endpointWrapper(_dataDeletionEndpoint));
}

export async function callDataDeletionBeginTopic(args: DataDeletionParams) {
  return await callPubSub(compliance.DATA_DELETION_BEGIN_TOPIC, {
    ...args,
    serviceId,
    beginAt: new Date().toISOString(),
  });
}

export async function callDataDeletionSuccessTopic(args: DataDeletionParams, message?: string) {
  return await callPubSub(compliance.DATA_DELETION_SUCCESS_TOPIC, {
    ...args,
    serviceId,
    successAt: new Date().toISOString(),
    message: message || `Service ${serviceId} successfully deleted data for shop ${args.shopId}`,
  });
}

export async function callDataDeletionFailureTopic(
  args: DataDeletionParams,
  errorMessage?: string
) {
  return await callPubSub(compliance.DATA_DELETION_FAILURE_TOPIC, {
    ...args,
    serviceId,
    failureAt: new Date().toISOString(),
    error: errorMessage || `Service ${serviceId} failed to delete data for shop ${args.shopId}`,
  });
}
