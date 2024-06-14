export declare type CurrencyConversionRequestParams = {
  fromCurrency: string;
  toCurrency: string;
  start: string;
  end: string;
};

export declare type CurrencyConversionResponse = {
  rates: Record<string, number>;
};
