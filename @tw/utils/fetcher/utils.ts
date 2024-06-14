import { callServiceEndpoint } from '../callServiceEndpoint';
import { SingleJob } from '@tw/types/module/services/job-manager';
import { ServicesIds } from '@tw/types/module/services';
import { Request } from 'express';

import { getLogger } from '../logger';
import { addTaskToQueue } from '../addTaskToQueue';
import { FetchChunkData } from '@tw/types/module/fetchers';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export async function updateJobIndex(jobID, index, shopDomain, jobType) {
  return await updateJob(jobID, {
    currentIndex: index,
    status: 'in_progress',
    shopDomain,
    jobType,
  });
}

export async function getJob(jobID: string): Promise<SingleJob> {
  return (
    await callServiceEndpoint<SingleJob>(
      'job-manager',
      `jobs/${jobID}`,
      {},
      { method: 'GET', log: false }
    )
  ).data;
}

export async function updateJob(jobID: string, update) {
  return (
    await callServiceEndpoint('job-manager', `jobs/${jobID}`, update, { method: 'PUT', log: false })
  ).data;
}

export function getJobLogger(jobData: any, taskName?) {
  const { jobID, index, shopDomain, dataType, day, jobType } = jobData;
  const loggerOptions = {
    name: jobID || 'unknown',
    jobID,
    index,
    day,
    jobType: jobType || 'unknown',
    shopDomain,
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

export async function callImport(req: Request, body: FetchChunkData, day, index) {
  const { shopDomain, jobID, dataType, days } = body;
  const queueName = req.headers['x-cloudtasks-queuename'] as string;

  await addTaskToQueue(
    queueName,
    serviceId,
    `${req.path}?day=${
      days ? days[index - 1].day : day
    }&shop=${shopDomain}&dataType=${dataType}&jobID=${jobID}`,
    {
      ...req.body,
      day: day,
      index: index,
    },
    { dispatchDeadline: 1800, deployment: process.env.TW_DEPLOYMENT }
  );
}
