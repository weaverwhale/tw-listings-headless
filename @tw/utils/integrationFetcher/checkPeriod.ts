import { callServiceEndpoint } from '../callServiceEndpoint';
import {
  ApiMetricsResponse,
  MetricsQueryStringParams,
  periodObject,
  IntegrationDataHealthFullReport,
  IntegrationDataHealthRequest
} from '@tw/types';
import { services, ServicesIds } from '@tw/types/module/services';
import { logger } from '../logger';

import moment from 'moment';
import { CHECK_STATUS, importDay } from '@tw/types/module/fetchers/fetchChunkData';
import { getServiceAccountData } from '../getServiceAccountData';
import { isDeltaError } from './healthCheck';

const serviceId = process.env.SERVICE_ID as ServicesIds;

export async function checkPeriod(periodRequest: IntegrationDataHealthRequest)
{
  const { accountId, start, end, jobId } = periodRequest;
  const serviceHealthCheckConf = services[periodRequest.serviceId].healthCheckConf;

  logger.info(
    `checkPeriod ${jobId ? `jobId ${jobId}` : ''} accountId ${accountId} start ${start} end ${end}`
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
        account_ids: [accountId],
        granularity: 'total',
        forceBigTable: true
      };

      const { data: dayFamilyCheck } = await callServiceEndpoint<
        ApiMetricsResponse,
        MetricsQueryStringParams
      >(
        'metrics-table',
        'get-metrics',
        {
          ...checkParam,
          family: 'day'
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
          family: 'hours'
        },
        { method: 'POST' }
      );

      return {
        hoursFamilyCheck,
        dayFamilyCheck,
        check: !isInternalDeltaError(
          hoursFamilyCheck.data[0]?.metricsBreakdown[0]?.metrics,
          dayFamilyCheck.data[0]?.metricsBreakdown[0]?.metrics
        )
      };
    } catch (e) {
      throw e;
    }
  }

  async function checkPeriodData(accountId, period: periodObject) {
    const accountCheck = await checkDayInternal(accountId, period.start);

    if (!accountCheck.check) {
      return CHECK_STATUS.INTERNAL_DELTA;
    }

    const params: IntegrationDataHealthRequest = {
      serviceId: periodRequest.serviceId,
      accountId,
      start: period.start,
      sendSlack: false,
      softImport: false,
      // @ts-ignore
      jobId: periodRequest.jobId,
      end: period.end,
      factor: periodRequest.factor
    };

    let healthStatus: Record<ServicesIds, IntegrationDataHealthFullReport[]>;
    try {
      healthStatus = (
        await callServiceEndpoint<
          Record<ServicesIds, IntegrationDataHealthFullReport[]>,
          IntegrationDataHealthRequest
        >('internal', 'data-health-check', params, {
          method: 'POST'
        })
      ).data;
    } catch (e) {
      throw e;
    }
    if (!healthStatus?.[periodRequest.serviceId]) return CHECK_STATUS.UNKNOWN;

    const accountHealthStatus: IntegrationDataHealthFullReport = healthStatus?.[
      periodRequest.serviceId
      ]?.find((x) => x.accountId === accountId);

    if (!accountHealthStatus) {
      logger.warn(
        `accountId ${accountId} account ${accountId} ${
          jobId ? `jobId ${jobId}` : ''
        } check for start ${period.start} end ${period.end} is unknown!`
      );
      return CHECK_STATUS.UNKNOWN;
    }
    if (
      accountHealthStatus &&
      isDeltaError(
        accountHealthStatus,
        periodRequest.factor,
        moment(period.end).diff(period.start, 'days')
      )
    ) {
      const notEmptyFields = Object.keys(accountHealthStatus.fieldsComparison).some(
        (field) => accountHealthStatus.fieldsComparison[field].internal
      );
      if (!notEmptyFields) {
        logger.warn(
          `accountId ${accountId} account ${accountId} ${
            jobId ? `jobId ${jobId}` : ''
          } check for start ${period.start} end ${period.end} internal data is ZERO!`
        );
        return CHECK_STATUS.INTERNAL_ZERO;
      }

      logger.warn(
        `accountId ${accountId} account ${accountId} ${
          jobId ? `jobId ${jobId}` : ''
        } check for start ${period.start} end ${period.end} is with DELTA!`
      );
      return CHECK_STATUS.DELTA;
    }

    logger.info(
      `accountId ${accountId} ${jobId ? `jobId ${jobId}` : ''} check for start ${
        period.start
      } end ${period.end} is GOOD!`
    );
    return CHECK_STATUS.GOOD;
  }

  const accountData = await getServiceAccountData(accountId);

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
        end: partialPeriodEnd.format('YYYY-MM-DD')
      });
      periodStart = partialPeriodEnd.add(1, 'days');
    }
  } else {
    stack.push({ start, end });
  }

  async function runSinglePeriodCheck(period: periodObject) {
    const daysDiff = moment(period.end).diff(moment(period.start), 'days');

    try {
      let periodStatus: CHECK_STATUS = await checkPeriodData(accountData, period);
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
              status: periodStatus
            });
          }
          if (periodStatus === CHECK_STATUS.INTERNAL_ZERO) return;
          else {
            logger.warn(
              `can't get health status for accountId ${accountId} ${
                jobId ? `jobId ${jobId}` : ''
              } start ${period.start} end ${period.end}. return all period with status UNKNOWN.`
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
    { accountId, jobId }
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
    `accountId ${accountId} ${
      jobId ? `jobId ${jobId}` : ''
    } days in period: ${daysDiff}. periods checks: ${periodsList.length}. days with delta: ${
      deltaDaysList.length
    }`
  );
  return {
    deltaDaysList: deltaDaysList.sort((a, b) => {
      return b.day.localeCompare(a.day);
    }),
    periodsList
  };
}
