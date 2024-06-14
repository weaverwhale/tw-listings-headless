import { MetricsTableDataWithCurrency } from './MetricsTableData';

export type AccountHealthReport = {
  allAccounts: Record<string, Partial<MetricsTableDataWithCurrency>>;
  errors: Record<string, any>;
};
