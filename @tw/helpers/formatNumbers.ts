export type valueFormats = 'decimal' | 'percent' | 'currency' | 'string';

export interface TwNumberFormatOptions extends Intl.NumberFormatOptions {
  style: valueFormats;
  dateFormat?: string;
}

export const formatNumber = (value: number, options: TwNumberFormatOptions): string => {
  // if you explicitly want a string, you get a string
  if (options.style === 'string') {
    return value.toString();
  }
  if (!value || Number.isNaN(+value) || !Number.isFinite(+value)) {
    value = 0;
  }
  return value.toLocaleString(undefined, options);
};
