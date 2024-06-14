import * as workflow from '@temporalio/workflow';

const RETRY_POLICY: workflow.RetryPolicy = {
  maximumAttempts: 10,
  nonRetryableErrorTypes: ['NonRetryableException'],
};

import { proxyActivities } from '@temporalio/workflow';

export async function run(queue: string, type: string, payload: any): Promise<any> {
  const result = await proxyActivities({
    taskQueue: queue,
    retry: RETRY_POLICY,
    startToCloseTimeout: '20 minute',
  })[type](payload);

  return result;
}
