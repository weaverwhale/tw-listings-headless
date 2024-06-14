import { FilterExpressions } from './Filters';

export type AdMgmtAuditLogsFilterOperator = 'contains' | 'not_contains' | 'equals' | 'not_equals';

export type AdMgmtAuditLogsFilterOperands = 'entity' | 'name' | 'user' | 'status';

export type AdMgmtAuditLogsRequest = {
  segments?: FilterExpressions<AdMgmtAuditLogsFilterOperands, AdMgmtAuditLogsFilterOperator>[];
  shop: string;
  start: string;
  end: string;
};
