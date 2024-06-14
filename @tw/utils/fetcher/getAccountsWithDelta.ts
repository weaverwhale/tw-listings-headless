import { DataHealthFullReport, dataHealthRequest } from '@tw/types/module/types';
import { ServicesIds } from '@tw/types/module/services';
import { logger } from '../logger';
import { callServiceEndpoint } from '../callServiceEndpoint';
import { isDeltaError } from './healthCheck';

export const getAccountsWithDelta = async (
  checkBefore: boolean,
  serviceId: ServicesIds,
  shopDomain: string,
  day: string,
  accounts: any[],
  jobID: string
) => {
  let accountsWithDelta;
  const params: dataHealthRequest = {
    serviceId,
    shopId: shopDomain,
    start: day,
    sendSlack: false,
    softImport: false,
    end: day,
    accountIds: accounts.map(({ id }) => id),
  };
  if (!checkBefore) {
    return accounts;
  }
  let healthCheckOk = true;
  let healthStatus: Record<ServicesIds, DataHealthFullReport[]>;
  try {
    logger.info(`healthStatus check before reimport day ${day} shop ${shopDomain} jobID ${jobID}`);
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
    healthCheckOk = false;
    logger.error(
      `ERROR healthStatus check before reimport day ${day} shop ${shopDomain} jobID ${jobID} error: ${e.message}`
    );
  }

  accountsWithDelta = accounts.filter(({ id }) => {
    const accountHealthStatus: DataHealthFullReport = healthStatus?.[serviceId]?.find(
      (x) => x.accountId === id
    );
    if (
      healthCheckOk &&
      accountHealthStatus &&
      !isDeltaError(
        accountHealthStatus,
        undefined, // factor, default 0.01
        undefined, // diffDays, default 1
        1
      )
    ) {
      logger.info(
        `Nothing change for account ${id} day ${day} shop ${shopDomain} jobID ${jobID} will not import, continue`
      );
      return false;
    } else {
      return true;
    }
  });

  return accountsWithDelta;
};
