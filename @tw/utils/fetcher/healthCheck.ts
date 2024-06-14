import { DataHealthFullReport, HealthCheckType } from '@tw/types';
import { services } from '@tw/types/module/services';
import { logger } from '../logger';

const DEFAULT_MIN_DELTA = 30;

export const isDeltaError = (
  fullReport: DataHealthFullReport,
  factor: number = 0.03,
  diffDays: number = 0,
  minDelta?: number,
  healthCheckType: HealthCheckType = HealthCheckType.AdsMetrics
) => {
  const logExtraData = {
    shopId: fullReport.shopId,
    factor,
    diffDays,
    minDelta,
    serviceId: fullReport.serviceId,
  };
  logger.info(`isDeltaError: started.`, logExtraData);

  const serviceHealthCheckConf = services[fullReport.serviceId].healthCheckConf?.fields;

  if (!serviceHealthCheckConf) {
    logger.warn(`isDeltaError: health-check conf is not defined for service.`, logExtraData);
    return false;
  }
  const criticalFields = Object.entries(serviceHealthCheckConf).filter(
    ([_, field]) => field.isCritical
  );

  factor = factor / (diffDays + 1);

  for (const [field, conf] of criticalFields) {
    const fieldMinDelta = minDelta || conf.minDelta || DEFAULT_MIN_DELTA;
    const internalNum = fullReport.fieldsComparison[field]?.internal;
    const delta = fullReport.fieldsComparison[field]?.delta;

    if (
      internalNum === undefined ||
      internalNum === null ||
      delta === undefined ||
      delta === null
    ) {
      logger.info(`isDeltaError: field: ${field}, return true undefined checking.`, logExtraData);
      return true;
    }
    if (!internalNum && Math.abs(delta) > 0) {
      logger.info(
        `isDeltaError: field: ${field}, return true internal 0 or null but not delta.`,
        logExtraData
      );
      return true;
    }
    const actualCheck =
      Math.abs(+delta?.toFixed(2) / +internalNum?.toFixed(2)) > factor &&
      Math.abs(delta) >= fieldMinDelta;
    if (actualCheck) {
      logger.info(
        `isDeltaError: field: ${field}, Math.abs(+delta?.toFixed(2) / +num?.toFixed(2)) = ${Math.abs(
          +delta?.toFixed(2) / +internalNum?.toFixed(2)
        )} 
                  > factor = ${factor} = ${
          Math.abs(+delta?.toFixed(2) / +internalNum?.toFixed(2)) > factor
        } && Math.abs(delta) 
                  >= ${fieldMinDelta} = ${
          Math.abs(delta) >= fieldMinDelta
        } equal - res ${actualCheck}.`,
        logExtraData
      );
      return true;
    }
  }

  logger.info(`isDeltaError: ended. return false end of the function.`, logExtraData);
  return false;
};
