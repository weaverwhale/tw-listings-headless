import { formatNumber } from "./formatNumbers";

export const formatChangeValue = (change: any, currency: string) => {
  if (!isNaN(change) && !isNaN(parseFloat(change))) {
    return formatNumber(+change, {
      currency: currency,
      style: 'currency',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else return change;
};