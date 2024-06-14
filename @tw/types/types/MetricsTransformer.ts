import { CreativeMetricsTableRow } from './CreativeAttributes';
import { MetricsTableDayRow, MetricsTableRow } from './MetricsTableRow';

export type MetricsTransformer = { hours_rows: MetricsTableRow[]; day_rows: MetricsTableDayRow[] };

export type CreativeMetricsTransformer = {
  regularCreativeMetricRows: CreativeMetricsTableRow[];
  dynamicCreativeMetricRows: CreativeMetricsTableRow[];
};
