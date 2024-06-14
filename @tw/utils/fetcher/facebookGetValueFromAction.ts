import { FacebookActionStat } from '@tw/types';

export const facebookGetValueFromAction = (
  data: FacebookActionStat,
  attributionWindow: string[]
) => {
  if (!data) return 0;
  let val = 0;
  attributionWindow.forEach((window) => {
    if (data[window]) {
      val += +data[window] || 0;
    }
  });
  return val;
};
