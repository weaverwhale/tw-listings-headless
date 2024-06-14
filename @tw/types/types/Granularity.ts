export const GranularityArr = ['hour', 'day', 'week', 'month', 'quarter', 'year', 'total'] as const;

export type Granularity = (typeof GranularityArr)[number];

export type allGranularity = {
  [t in Granularity]: t;
};

export const granularityRoles: allGranularity = {
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  total: 'total',
};
