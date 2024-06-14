import { FilterExpressions } from './Filters';

export type RulesAuditLogsFilterOperator = 'contains' | 'not_contains' | 'equals' | 'not_equals';

export type RulesAuditLogsFilterOperands =
  | 'campaign_id'
  | 'campaign_name'
  | 'adset_id'
  | 'adset_name'
  | 'ad_id'
  | 'ad_name'
  | 'rule_name'
  | 'user';

export type AuditRuleStatus = 'falsy' | 'created' | 'executed' | 'failed';

export type RulesAuditLogsRequest = {
  segments?: FilterExpressions<RulesAuditLogsFilterOperands, RulesAuditLogsFilterOperator>[];
  shop: string;
  status?: AuditRuleStatus;
  start: string;
  end: string;
  searchAfter?: number;
  pageSize?: number;
  auditTypes?: string[];
};
