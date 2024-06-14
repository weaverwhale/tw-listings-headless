import retry from 'async-retry';
import { Request, Response } from 'express';
import moment from 'moment-timezone';
import {
  FetchChunkData,
  CHECK_STATUS,
  startJobOptions,
  startJobResponse,
} from '@tw/types/module/fetchers';
import { ServicesIds } from '@tw/types/module/services';
import { checkPeriod } from './checkPeriod';
import { getJobLogger } from './utils';
import { checkPrecondition, onFailure, onSuccess } from './index';
import { getJob, updateJob } from './utils';
import { getShopData } from '../getShopData';
import { updateLastImport } from '../shopServices';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export async function startJob(args: startJobOptions): Promise<startJobResponse> {
  const req: Request = args.req as any;
  const {
    defaultEndpoint = 'import-day-data',
    queueName = `${serviceId}-import-day-data`,
    endpoints,
  } = args;

  const data = req.body.data as FetchChunkData;
  const taskName = req.headers['x-cloudtasks-taskname'];
  const logger = getJobLogger(data, taskName);

  logger.info('start job request');
  const jobManagerData = await getJob(data.jobID);
  // if (jobManagerData?.status === 'in_progress') {
  //   logger.warn(
  //     `${serviceId} start-job shop ${data.shopDomain} jobID ${data.jobID} already running ignoring this call`
  //   );
  //   throw `${serviceId} start-job shop ${data.shopDomain} jobID ${data.jobID} already running ignoring this call`;
  // }

  if (serviceId !== req.body.attributes['serviceId']) {
    logger.warn(`expected service id ${serviceId} but got: ${req.body.attributes['serviceId']}`);
    throw new Error(
      `expected service id ${serviceId} but got: ${req.body.attributes['serviceId']}`
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
        `start initial import for shop ${data.shopDomain} checkPeriod before jobId ${data.jobID}`
      );
      await updateJob(data.jobID, {
        status: 'in_progress',
      });

      const { deltaDaysList, periodsList } = await checkPeriod({
        shopId: data.shopDomain,
        start: moment(data.day).subtract(data.total, 'days').format('YYYY-MM-DD'),
        end: data.day,
        jobId: data.jobID,
        jobType: data.jobType,
        serviceId: serviceId,
        healthCheckType: data.healthCheckType,
        accountIds: data.accountIds,
      });

      logger.info(
        `Initial import for shop ${data.shopDomain} jobId ${
          data.jobID
        } checkPeriod before done #days ${deltaDaysList.length} days:${JSON.stringify(
          deltaDaysList
        )} , Took: ${new Date().getTime() - timestamp}ms`
      );
      logger.info(
        `Initial import for shop ${data.shopDomain} jobId ${
          data.jobID
        } checkPeriod before done, periodsList ${JSON.stringify(periodsList)}`
      );

      if (deltaDaysList.length === 0) {
        logger.info(
          `Finish import for shop ${data.shopDomain} jobId ${data.jobID} 0 days to import`
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
        `error while checkPeriod before for shop ${data.shopDomain} jobid ${data.jobID}`,
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
  let body = req.body as FetchChunkData;
  const queueName = req.headers['x-cloudtasks-queuename'] as string;
  const taskName = req.headers['x-cloudtasks-taskname'];
  let { shopData } = body;
  const { jobType, index, shopDomain, jobID, dataType, forceExternalFetch, days, accountIds } =
    body;
  shopData = shopData ?? (await getShopData(shopDomain, { mongo: jobType !== 'initial' }));
  let { total, day } = body;
  const logger = getJobLogger(body, taskName);
  let timer;

  const preconditionResult = await checkPrecondition(req);
  if (!preconditionResult.continue) {
    logger.info(
      `Precondition continue for jobID ${jobID} shopDomain ${shopDomain} will not import`
    );
    return res.send('ok');
  }

  try {
    if (days && total) {
      const message = `when using days, total and day are manage internally, don't send them jobID ${jobID}`;
      logger.error(message);
      const result = await onFailure(req);
      return res.status(418).send(result);
    }

    if (!total && days) {
      if (days.length === 0) {
        // in case the health check find 0 days to import - just close the job
        logger.info(`import day JobId ${jobID} shopDomain ${shopDomain} days is 0 done the job`);
        await onSuccess(req);
        return res.send('ok');
      }
      total = days.length;
      (day as any) = days[index - 1]?.day ?? days[index - 1];
      logger.debug(`import day ${day} index ${index} days ${JSON.stringify(days)} JobId ${jobID}`);
      logger.info(`import day ${day} index ${index} JobId ${jobID}`);
    }

    if (!shopDomain) {
      const message = `error no shopDomain (${shopData}) JobId ${jobID}`;
      logger.error(message);
      const result = await onFailure(req);
      return res.status(418).send(result);
    }

    await updateJob(jobID, {
      currentIndex: index,
      status: 'in_progress',
      shopDomain,
      jobType,
    });

    logger.info(
      `starting import day shopDomain ${shopDomain} day ${day} type ${jobType} jobId ${jobID}`
    );

    let checkBefore: boolean = body.checkBefore !== false;
    if (days) {
      checkBefore = days[index - 1]?.status === CHECK_STATUS.UNKNOWN || false;
    }

    await retry(
      async () => {
        logger.info(
          `Calling fetchFunction import day shopDomain ${shopDomain} day ${day} total ${total} type ${jobType} jobId ${jobID} checkBefore ${checkBefore}`
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
    await updateLastImport(shopDomain, serviceId, day ? moment(day).toDate() : moment().toDate());
    await onSuccess(req);
    return res.send('ok');
  } catch (e) {
    logger.warn(
      `importDayFetcher general error shopDomain ${shopDomain} jobID ${jobID} jobType ${jobType}:  error: ${JSON.stringify(
        e
      )}`
    );
    clearTimeout(timer);
    const result = await onFailure(req, e);
    return res.status(418).send(result);
  }
}
