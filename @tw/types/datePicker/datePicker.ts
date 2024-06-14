export type PreviousPeriodIds =
  | 'none'
  | 'default'
  | 'previousPeriod'
  | 'previousWeek'
  | 'previousMonth'
  | 'previousQuarter'
  | 'previousYear'
  | 'custom';


export type Period = 'week' | 'month' | 'quarter' | 'year';

export const mapFromPeriodIdToTimeUnit: Record<PreviousPeriodIds, Period | null> = {
  previousWeek: 'week',
  previousMonth: 'month',
  previousQuarter: 'quarter',
  previousYear: 'year',
  default: null,
  none: null,
  previousPeriod: null,
  custom: null,
};