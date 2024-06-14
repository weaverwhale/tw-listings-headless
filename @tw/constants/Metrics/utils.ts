import { MetricsKeys } from '@tw/types/module/metrics/metrics';

export const sum = (items: any[], key: MetricsKeys) => {
  return items?.reduce((acc, curr) => acc + (curr[key] || 0), 0);
};

export const divide = (items: any[], key: MetricsKeys, by: MetricsKeys | number, multiplyKey?: number) => {
  const numerator = sum(items, key) * (multiplyKey || 1);
  const denominator = typeof by === 'number' ? by : sum(items, by);
  return safeDivide(numerator, denominator);
};

export function safeDivide(numerator: number, denominator: number) {
  if (!numerator || !denominator) {
    return 0;
  }
  if (!isFinite(numerator) || !isFinite(denominator)) {
    return 0;
  }
  return numerator / denominator || 0;
}

export const avg = (items: any[], key: MetricsKeys) => {
  return safeDivide(sum(items, key), items.length);
};
