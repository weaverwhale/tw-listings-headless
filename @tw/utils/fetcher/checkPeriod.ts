import { callServiceEndpoint } from '../callServiceEndpoint';
import {
  ApiMetricsResponse,
  dataHealthRequest,
  MetricsQueryStringParams,
  periodObject,
} from '@tw/types';
import { services, ServicesIds } from '@tw/types/module/services';
import { logger } from '../logger';

import moment from 'moment';
import { getShopData } from '../getShopData';
import { CHECK_STATUS, importDay } from '@tw/types/module/fetchers/fetchChunkData';
import { isDeltaError } from './healthCheck';
import { DataHealthFullReport, HealthCheckType } from '@tw/types';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export async function checkPeriod(periodRequest: dataHealthRequest) {
  // @ts-ignore
  const {
    shopId,
    start,
    end,
    jobId,
    jobType,
    healthCheckType = HealthCheckType.AdsMetrics,
    accountIds,
  } = periodRequest;
  const serviceHealthCheckConf = services[periodRequest.serviceId].healthCheckConf;

  logger.info(
    `checkPeriod ${jobId ? `jobId ${jobId}` : ''} ${
      jobType ? `jobType ${jobType}` : ''
    } shopId ${shopId} start ${start} end ${end}`
  );

  async function checkDayInternal(accountId: string, day: string) {
    const list = [];
    const isInternalDeltaError = (dataA, dataB) => {
      const factor = 0.005;
      const { spend: spendA } = dataA || {};
      const { spend: spendB } = dataB || {};
      return Math.abs(spendA / spendB - 1) > factor;
    };
    try {
      const checkParam: MetricsQueryStringParams = {
        start: day,
        end: day,
        service_id: periodRequest.serviceId,
        data_type: 'ads-metrics',
        forceBigTable: true, // TODO temp until the data will be updated in BQ
        shopId,
        account_ids: [accountId],
        granularity: 'total',
      };

      const { data: dayFamilyCheck } = await callServiceEndpoint<
        ApiMetricsResponse,
        MetricsQueryStringParams
      >(
        'metrics-table',
        'get-metrics',
        {
          ...checkParam,
          family: 'day',
        },
        { method: 'POST' }
      );

      const { data: hoursFamilyCheck } = await callServiceEndpoint<
        ApiMetricsResponse,
        MetricsQueryStringParams
      >(
        'metrics-table',
        'get-metrics',
        {
          ...checkParam,
          family: 'hours',
        },
        { method: 'POST' }
      );

      return {
        hoursFamilyCheck,
        dayFamilyCheck,
        check: !isInternalDeltaError(
          hoursFamilyCheck.data[0]?.metricsBreakdown[0]?.metrics,
          dayFamilyCheck.data[0]?.metricsBreakdown[0]?.metrics
        ),
      };
    } catch (e) {
      throw e;
    }
  }

  async function checkPeriodData(shopData, period: periodObject) {
    const allAccounts = services[periodRequest.serviceId].getAccounts(shopData);
    const accounts = allAccounts.filter(
      (acc) => !accountIds || !accountIds.length || accountIds.includes(acc.id)
    );
    if (moment(period.start).isSame(period.end)) {
      const checkPromises = accounts.map(async (acc) => {
        return await checkDayInternal(acc.id, period.start);
      });

      const accountCheck = await Promise.all(checkPromises);

      let hasInternalDelta = false;
      accountCheck.forEach((c) => {
        if (!c.check) hasInternalDelta = true;
      });

      if (hasInternalDelta) return CHECK_STATUS.INTERNAL_DELTA;
    }

    const params: dataHealthRequest = {
      serviceId: periodRequest.serviceId,
      shopId,
      start: period.start,
      sendSlack: false,
      softImport: false,
      jobId: periodRequest.jobId,
      end: period.end,
      factor: periodRequest.factor,
      healthCheckType,
      accountIds,
    };

    let healthStatus: Record<ServicesIds, DataHealthFullReport[]>;
    try {
      healthStatus = (
        await callServiceEndpoint<Record<ServicesIds, DataHealthFullReport[]>, dataHealthRequest>(
          'internal',
          'data-health-check',
          params,
          {
            method: 'POST',
          }
        )
      ).data;
    } catch (e) {
      throw e;
    }
    if (!healthStatus?.[periodRequest.serviceId]) return CHECK_STATUS.UNKNOWN;

    for (const { id } of accounts) {
      const accountHealthStatus: DataHealthFullReport = healthStatus?.[
        periodRequest.serviceId
      ]?.find((x) => x.accountId === id);

      if (!accountHealthStatus) {
        logger.warn(
          `shop ${shopId} account ${id} ${jobId ? `jobId ${jobId}` : ''} check for start ${
            period.start
          } end ${period.end} is unknown!`
        );
        return CHECK_STATUS.UNKNOWN;
      }
      if (
        accountHealthStatus &&
        isDeltaError(
          accountHealthStatus,
          periodRequest.factor,
          moment(period.end).diff(period.start, 'days'),
          undefined
        )
      ) {
        const notEmptyFields = Object.keys(accountHealthStatus.fieldsComparison).some(
          (field) => accountHealthStatus.fieldsComparison[field].internal
        );
        if (!notEmptyFields) {
          logger.warn(
            `shop ${shopId} account ${id} ${jobId ? `jobId ${jobId}` : ''} check for start ${
              period.start
            } end ${period.end} internal data is ZERO!`
          );
          return CHECK_STATUS.INTERNAL_ZERO;
        }

        logger.warn(
          `shop ${shopId} account ${id} ${jobId ? `jobId ${jobId}` : ''} check for start ${
            period.start
          } end ${period.end} is with DELTA!`
        );
        return CHECK_STATUS.DELTA;
      }
    }

    logger.info(
      `shop ${shopId} ${jobId ? `jobId ${jobId}` : ''} check for start ${period.start} end ${
        period.end
      } is GOOD!`
    );
    return CHECK_STATUS.GOOD;
  }

  const shopData = await getShopData(shopId, { mongo: periodRequest?.jobType !== 'initial' });

  let stack: periodObject[] = [];
  let newStack: periodObject[] = [];
  let deltaDaysList: importDay[] = [];
  let periodsList: any[] = [];

  const dateRangeLimit = services[serviceId].dateRangeLimit;

  if (dateRangeLimit) {
    let periodStart = moment(start);
    let periodEnd = moment(end);

    while (periodStart <= periodEnd) {
      let partialPeriodEnd = moment
        .min(periodEnd, moment(periodStart).add(dateRangeLimit - 1, 'days'))
        .clone();

      stack.push({
        start: periodStart.format('YYYY-MM-DD'),
        end: partialPeriodEnd.format('YYYY-MM-DD'),
      });
      periodStart = partialPeriodEnd.add(1, 'days');
    }
  } else {
    stack.push({ start, end });
  }

  async function runSinglePeriodCheck(period: periodObject) {
    const daysDiff = moment(period.end).diff(moment(period.start), 'days');

    try {
      let periodStatus: CHECK_STATUS = await checkPeriodData(shopData, period);
      periodsList.push({ ...period, status: periodStatus });
      switch (periodStatus) {
        case CHECK_STATUS.GOOD:
          return;
        // continue;
        case CHECK_STATUS.UNKNOWN:
        case CHECK_STATUS.INTERNAL_ZERO:
          const days = moment(period.end).diff(moment(period.start), 'days');
          for (let i = 0; i <= days; i++) {
            deltaDaysList.push({
              day: moment(period.end).subtract(i, 'days').format('YYYY-MM-DD'),
              status: periodStatus,
            });
          }
          if (periodStatus === CHECK_STATUS.INTERNAL_ZERO) return;
          else {
            logger.warn(
              `can't get health status for ${shopId} ${jobId ? `jobId ${jobId}` : ''} start ${
                period.start
              } end ${period.end}. return all period with status UNKNOWN.`
            );
            return;
            // throw `can't get health status for ${shopId} ${jobId ? `jobId ${jobId}` : ''} start ${
            //   period.start
            // } end ${period.end}`;
          }

        // continue;
      }

      switch (daysDiff) {
        // not neccery becouse the next option, we not adding single day period to the stack
        case 0:
          deltaDaysList.push({ day: period.start, status: periodStatus });
          return;
      }
    } catch (e) {
      throw e;
    }

    const splitPeriodDay = moment(period.start).add(Math.floor(daysDiff / 2), 'days');

    newStack.push({ start: period.start, end: splitPeriodDay.format('YYYY-MM-DD') });
    newStack.push({ start: splitPeriodDay.add(1, 'days').format('YYYY-MM-DD'), end: period.end });
  }

  logger.info(
    `checkPeriod: start checking. isSerialPeriodsChecks: ${serviceHealthCheckConf?.isSerialPeriodsChecks}`,
    { shopId, jobId }
  );

  while (stack.length > 0) {
    if (serviceHealthCheckConf?.isSerialPeriodsChecks) {
      for (const period of stack) {
        await runSinglePeriodCheck(period);
      }
    } else {
      const promises = stack.map(async (period: periodObject) => runSinglePeriodCheck(period));
      await Promise.all(promises);
    }

    stack = newStack;
    newStack = [];
  }
  const daysDiff = moment(end).diff(moment(start), 'days') + 1;

  logger.info(
    `shopId ${shopId} ${
      jobId ? `jobId ${jobId}` : ''
    } days in period: ${daysDiff}. periods checks: ${periodsList.length}. days with delta: ${
      deltaDaysList.length
    }`
  );

  return {
    deltaDaysList: deltaDaysList.sort((a, b) => {
      return b.day.localeCompare(a.day);
    }),
    periodsList,
  };
}
