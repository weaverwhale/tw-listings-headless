import retry from 'async-retry';
import { Request, Response } from 'express';
import moment from 'moment-timezone';

import { ServicesIds } from '@tw/types/module/services';
import { checkPeriod, checkPrecondition, onFailure, onSuccess } from './index';

import { getJob, getJobLogger, updateJob, updateServiceLastUpdated } from './utils';
import { CHECK_STATUS, startJobOptions } from '@tw/types/module/fetchers';
import { getServiceAccountData } from '../getServiceAccountData';
import {
  IntegrationFetchChunkData,
  IntegrationStartJobResponse,
} from '@tw/types/module/integrationFetchers';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export async function startJob(args: startJobOptions): Promise<IntegrationStartJobResponse> {
  const req: Request = args.req as any;
  const {
    defaultEndpoint = 'import-day-data',
    queueName = `${serviceId}-import-day-data`,
    endpoints,
  } = args;

  const data = req.body.data as IntegrationFetchChunkData;
  const taskName = req.headers['x-cloudtasks-taskname'];
  const logger = getJobLogger(data, taskName);

  logger.info('start job request');
  const jobManagerData = await getJob(data.jobID);

  if (serviceId !== req.body.attributes['serviceId']) {
    logger.warn(`expected service id ${serviceId} but got: ${req.body.attributes['serviceId']}`);
    throw new Error(
      `expected service id ${serviceId} but got: ${req.body.attributes['serviceId']}`
    );
  }
  if (serviceId !== data.serviceId) {
    logger.warn(
      `expected service id ${serviceId} but got accountData service id: ${req.body.attributes['serviceId']}`
    );
    throw new Error(
      `expected service id ${serviceId} but got accountData service id: ${req.body.attributes['serviceId']}`
    );
  }

  const endpoint =
    endpoints?.find((ep) => ep.conditionString === data[ep.conditionField])?.endpoint ||
    defaultEndpoint;

  logger.info(`checkBefore from api ${data.checkBefore} jobId ${data.jobID}`);

  if (data.jobType === 'initial' && data.checkBefore) {
    try {
      const timestamp = new Date().getTime();
      logger.info(
        `start initial import for service ${data.serviceId} accountId ${data.accountId} checkPeriod before jobId ${data.jobID}`
      );
      await updateJob(data.jobID, {
        status: 'in_progress',
      });

      const { deltaDaysList, periodsList } = await checkPeriod({
        accountId: data.accountId,
        start: moment(data.day).subtract(data.total, 'days').format('YYYY-MM-DD'),
        end: data.day,
        jobId: data.jobID,
        serviceId: serviceId,
      });

      logger.info(
        `Initial import for accountId ${data.accountId} jobId ${
          data.jobID
        } checkPeriod before done #days ${deltaDaysList.length} days:${JSON.stringify(
          deltaDaysList
        )} , Took: ${new Date().getTime() - timestamp}ms`
      );
      logger.info(
        `Initial import for accountId ${data.accountId} jobId ${
          data.jobID
        } checkPeriod before done, periodsList ${JSON.stringify(periodsList)}`
      );

      if (deltaDaysList.length === 0) {
        logger.info(
          `Finish import for accountId ${data.accountId} jobId ${data.jobID} 0 days to import`
        );
      }

      await updateJob(data.jobID, {
        total: deltaDaysList.length,
      });

      data.days = deltaDaysList;
      data.day = null;
      data.total = null;
      data.checkBefore = false;
    } catch (e) {
      logger.error(
        `error while checkPeriod before for accountId ${data.accountId} jobid ${data.jobID}`,
        e
      );
    }
  }

  return { data, endpoint, queueName };
}

export async function importDayFetcher(
  req: Request,
  res: Response,
  fetchFunction: (args: any) => Promise<any>
) {
  let body = req.body as IntegrationFetchChunkData;
  const queueName = req.headers['x-cloudtasks-queuename'] as string;
  const taskName = req.headers['x-cloudtasks-taskname'];
  let { accountData } = body;
  const { jobType, index, accountId, jobID, dataType, forceExternalFetch, days } = body;
  accountData = accountData ?? (await getServiceAccountData(accountId));
  let { total, day } = body;
  const logger = getJobLogger(body, taskName);
  let timer;

  const preconditionResult = await checkPrecondition(req);
  if (!preconditionResult.continue) return res.send('ok');

  try {
    if (days && total) {
      const message = `when using days, total and day are manage internally, don't send them jobID ${jobID}`;
      logger.error(message, accountData);
      const result = await onFailure(req);
      return res.status(418).send(result);
    }

    if (!total && days) {
      if (days.length === 0) {
        // in case the health check find 0 days to import - just close the job
        logger.info(`import day JobId ${jobID} accountId ${accountId} days is 0 done the job`);
        await onSuccess(req);
        return res.send('ok');
      }
      total = days.length;
      (day as any) = days[index - 1]?.day ?? days[index - 1];
      logger.info(
        `import accountId ${accountId} day ${day} index ${index} days ${JSON.stringify(
          days
        )} JobId ${jobID}`
      );
    }

    if (!accountId) {
      const message = `error no accountId (${accountId}) JobId ${jobID}`;
      logger.error(message);
      const result = await onFailure(req);
      return res.status(418).send(result);
    }

    await updateJob(jobID, {
      currentIndex: index,
      status: 'in_progress',
      accountId,
      jobType,
    });

    logger.info(
      `starting import day accountId ${accountId} day ${day} type ${jobType} jobId ${jobID}`
    );

    let checkBefore: boolean = body.checkBefore !== false;
    if (days) {
      checkBefore = days[index - 1]?.status === CHECK_STATUS.UNKNOWN || false;
    }

    await retry(
      async () => {
        logger.info(
          `Calling fetchFunction import day accountId ${accountId} day ${day} total ${total} type ${jobType} jobId ${jobID} checkBefore ${checkBefore}`
        );
        await fetchFunction({ ...body, total, day, checkBefore });
      },
      {
        retries: 1,
        maxTimeout: 2 * 60 * 1000, // max 2 minutes between retries
        onRetry: (e) => {
          let msg;
          try {
            msg = JSON.stringify(e);
          } catch {}
          logger.warn(`Doing retry on error jobId ${jobID}: ${msg ?? e}`);
        },
      }
    );
    try {
      await updateServiceLastUpdated(
        accountId,
        serviceId,
        day ? moment(day).toISOString() : moment().toISOString()
      );
    } catch (e) {
      logger.error(`importDayFetcher updateServiceLastUpdated failed ERROR `, e);
    }
    await onSuccess(req);
    return res.send('ok');
  } catch (e) {
    logger.warn(
      `importDayFetcher general error accountId ${accountId} jobID ${jobID} jobType ${jobType}:  error:`,
      e
    );
    clearTimeout(timer);
    const result = await onFailure(req, e);
    return res.status(418).send(result);
  }
}
