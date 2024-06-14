import { callServiceEndpoint } from '../callServiceEndpoint';
import { SingleIntegrationJob } from '@tw/types/module/services/job-manager';
import { ServicesIds } from '@tw/types/module/services';
import { Request } from 'express';

import { getLogger } from '../logger';
import { addTaskToQueue } from '../addTaskToQueue';

import moment from 'moment-timezone';
import { IntegrationFetchChunkData } from '@tw/types/module/integrationFetchers';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export async function updateJobIndex(jobID, index, shopDomain, jobType) {
  return await updateJob(jobID, {
    currentIndex: index,
    status: 'in_progress',
    shopDomain,
    jobType,
  });
}

export async function getJob(jobID: string): Promise<SingleIntegrationJob> {
  return (
    await callServiceEndpoint<SingleIntegrationJob>(
      'job-manager',
      `integration/jobs/${jobID}`,
      {},
      { method: 'GET' }
    )
  ).data;
}

export async function updateJob(jobID: string, update) {
  return (
    await callServiceEndpoint('job-manager', `integration/jobs/${jobID}`, update, { method: 'PUT' })
  ).data;
}

export function getJobLogger(jobData: any, taskName?) {
  const { jobID, index, accountId, dataType, day } = jobData;
  const loggerOptions = {
    name: jobID || 'unknown',
    jobID,
    index,
    day,
    accountId,
    serviceId,
    dataType,
  };
  if (taskName) {
    loggerOptions['taskName'] = taskName;
  }
  const logger = getLogger({ options: loggerOptions });
  return logger;
}

export function preRequestTimeout(timeoutHandle, handleTimeout: () => any) {
  const timer = setTimeout(handleTimeout, timeoutHandle);
  return timer;
}

export async function callImport(req: Request, body: IntegrationFetchChunkData, day, index) {
  const { accountId, jobID, dataType, days } = body;
  const queueName = req.headers['x-cloudtasks-queuename'] as string;

  await addTaskToQueue(
    queueName,
    serviceId,
    `${req.path}?day=${
      days ? days[index - 1].day : day
    }&accountId=${accountId}&dataType=${dataType}&jobID=${jobID}`,
    {
      ...req.body,
      day: day,
      index: index,
    },
    { dispatchDeadline: 1800 }
  );
}

export async function updateServiceLastUpdated(
  accountId: string,
  serviceId?: string,
  lastUpdated?: string
): Promise<void> {
  if (!serviceId) {
    serviceId = process.env.SERVICE_ID;
  }
  await callServiceEndpoint<void>(
    serviceId,
    'update-account-last-updated',
    { id: accountId, lastUpdated: lastUpdated || moment().toISOString() },
    { method: 'POST' }
  );
}
