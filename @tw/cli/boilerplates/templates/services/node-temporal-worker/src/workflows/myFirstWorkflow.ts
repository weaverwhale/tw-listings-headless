import * as wf from '@temporalio/workflow';
import { proxySinks, Sinks } from '@temporalio/workflow';
import type * as activities from '../activities';
import { ACTIVITY_SETTINGS } from '@tw/temporal/module/workflow';

const { logger } = proxySinks<Sinks>();

export async function myFirstWorkflow(params: any) {
  const { myFirstActivity } = wf.proxyActivities<typeof activities>({
    taskQueue: `${process.env.SERVICE_ID}-queue`,
    ...ACTIVITY_SETTINGS,
  });

  const res = await myFirstActivity({
    params,
  });

  throw new Error('Not implemented');
}
