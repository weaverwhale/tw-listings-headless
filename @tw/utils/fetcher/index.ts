export * from './checkPeriod';
export * from './healthCheck';
export * from './endpointHandlers';

import { Request } from 'express';
import moment from 'moment-timezone';
import { FetchChunkData } from '@tw/types/module/fetchers';
import { ServicesIds } from '@tw/types/module/services';

import { callImport, getJob, getJobLogger, preRequestTimeout, updateJob } from './utils';
import { getShopData } from '../getShopData';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { isProviderConnectedToShop } from '../shop';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export type preconditionResult = { continue: boolean; message?: any; timer?: NodeJS.Timeout };

export async function checkPrecondition(
  req: Request,
  args?: { timeoutHandle?: number }
): Promise<preconditionResult> {
  const body = req.body as FetchChunkData;
  const retryCount = +req.headers['x-cloudtasks-taskretrycount'];
  const taskName = req.headers['x-cloudtasks-taskname'];
  const { jobType, index, shopDomain, jobID, shopData, day, dataType } = body;
  const { timeoutHandle } = args || {};
  let timer: NodeJS.Timeout;
  const logger = getJobLogger(body, taskName);

  const jobManagerData = await getJob(jobID);

  // when starting `index` is 1 and jobManagerData.currentIndex is 0

  // Check if canceled
  if (jobManagerData.requestCancel) {
    await updateJob(jobID, {
      status: 'done',
      canceledAt: Date.now(),
      successful: false,
      shopDomain,
      jobType,
    });
    const message = `job was canceled jobID ${jobID}`;
    logger.warn(message);
    return { continue: false, message };
  }

  // check if duplicate
  if (jobManagerData.currentIndex === index) {
    // might still be a retry
    if (retryCount === 0) {
      const message = `this might be a duplicate jobID ${jobID}`;
      logger.warn(message);
      return { continue: false, message };
    }
  }

  // check starting at earlier index then current
  if (index < jobManagerData.currentIndex) {
    // this will choke wild forks
    const message = `got a request to start with index ${index} but job manager is already on ${jobManagerData.currentIndex} jobID ${jobID}`;
    logger.warn(message);
    return { continue: false, message };
  }

  // Check if forked due to timeout ;)
  if (retryCount > 0 && req.headers['x-cloudtasks-taskpreviousresponse'] === '0') {
    // we have a retry that is not a 4xx or 5xx error so if current index was started we
    // prob had a timeout
    if (jobManagerData.currentIndex === index) {
      // https://cloud.google.com/tasks/docs/creating-http-target-tasks#handler
      const message = `We got a retry that is a fork, not retrying. jobID ${jobID} headers: ${JSON.stringify(
        req.headers
      )}`;
      logger.error(message);
      return { continue: false, message };
    }
    logger.info(`network related retry jobID ${jobID}`);
  }
  if (
    !isProviderConnectedToShop(
      await getShopData(shopDomain, { mongo: jobType !== 'initial' }),
      serviceId
    )
  ) {
    await updateJob(jobID, {
      status: 'failed',
      failedAt: Date.now(),
      successful: false,
      shopDomain,
      jobType,
    });
    const message = `No ${serviceId} Access Token or Accounts for shop ${shopDomain} jobID ${jobID}`;
    logger.info(message);
    return { continue: false, message };
  }

  if (timeoutHandle) {
    timer = preRequestTimeout(timeoutHandle, async () => {
      const jobManagerData = await getJob(jobID);

      if (!(jobManagerData.currentIndex === index)) {
        // this is mostly for shopify products that run in a single loop, and we do not want to
        // restart them, if they fail so be it.
        // this does work for the rest bcuz most of the times when we get a timeout, it's not bcuz
        // the job is still runinng but bcuz it got stuck and will never recover,
        // but sometimes imports might take morw than an hour, just something to keep
        // in mind.
        logger.warn(
          `getting close to timeout, but job manager has different index, ${jobManagerData.currentIndex} ${index} jobID ${jobID}`
        );
        return;
      }

      logger.warn(
        `very close to timeout so updating job and resending current task jobID ${jobID}`
      );
      await updateJob(jobID, { currentIndex: index - 1 });
      // recall this
      await callImport(req, body, day, index);
    });
  }
  logger.info(`precondition ${shopDomain} day ${day} type ${jobType} jobID ${jobID}`);
  req['timer'] = timer;
  return { continue: true, timer };
}

export async function onSuccess(req: Request) {
  const body = req.body as FetchChunkData;
  const taskName = req.headers['x-cloudtasks-taskname'];
  const { jobType, index, shopDomain, jobID, day, days } = body;
  let { total } = body;
  const logger = getJobLogger(body, taskName);

  if (req['timer']) clearTimeout(req['timer']);

  if (days?.length) {
    total = days?.length;
  }

  // Check if done
  if (index >= total) {
    if (jobType === 'initial') {
      try {
        await callServiceEndpoint(
          'internal',
          'data-health-check/recheck-health-by-reports',
          { jobId: jobID },
          { method: 'POST' }
        );
      } catch (error) {
        logger.error(`error updating data health report after job done ${jobID}`, { error });
      }
    }
    await updateJob(jobID, {
      status: 'done',
      finishedAt: Date.now(),
      successful: true,
      shopDomain,
      jobType,
    });
    logger.info(`done job jobId ${jobID}`);
    return { success: true };
  }

  // call next

  const nextDay = days ? null : moment(day).subtract(1, 'days').format('YYYY-MM-DD');
  // const nextDay = moment(day).subtract(1, 'days').format('YYYY-MM-DD');
  logger.info(
    `import nextDay shopDomain ${shopDomain} nextDay ${
      days ? days[index].day : nextDay
    } type ${jobType} jobId ${jobID}`
  );

  await callImport(req, body, nextDay, index + 1);
  logger.info(`finished import`);
}

export async function onFailure(req: Request, e?) {
  const body = req.body as FetchChunkData;
  const taskName = req.headers['x-cloudtasks-taskname'];
  const { jobType, shopDomain, jobID } = body;
  const logger = getJobLogger(body, taskName);
  if (req['timer']) clearTimeout(req['timer']);
  await updateJob(jobID, {
    successful: false,
    status: 'failed',
    failedAt: Date.now(),
    shopDomain,
    jobType,
  });
  if (e) {
    logger.error(
      `onFailure shopDomain ${shopDomain} jobID ${jobID} jobType ${jobType},  error: ${JSON.stringify(
        e
      )}`
    );
  }
  return { success: false };
}
