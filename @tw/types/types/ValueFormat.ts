export type valueFormats = 'decimal' | 'percent' | 'currency' | 'string' | 'date' | 'duration';

export interface TwNumberFormatOptions extends Intl.NumberFormatOptions {
  style: valueFormats;
}
