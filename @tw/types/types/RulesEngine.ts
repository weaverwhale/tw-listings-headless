export type EntityTypes = 'account' | 'campaign' | 'adset' | 'ad' | '';

export type MetricFields = {
    show: EntityTypes[];
    value: string;
    label: string;
    showCurrency?: boolean;
    showWarning?: boolean;
};

export const rulesActionDropdown: Record<string, MetricFields> = {
    increase_budget: {
      show: ['campaign', 'adset'],
      value: 'increase_budget',
      label: 'Increase %entity% budget by ($)',
      showWarning: true /* show a warning for increase budget multiple times a day */,
    },
    'increase_budget-percentage': {
      show: ['campaign', 'adset'],
      value: 'increase_budget-percentage',
      label: 'Increase %entity% budget by (%)',
      showWarning: true /* show a warning for increase budget multiple times a day */,
    },
    decrease_budget: {
      show: ['campaign', 'adset'],
      value: 'decrease_budget',
      label: 'Decrease %entity% budget by ($)',
      showWarning: true /* show a warning for decrease budget multiple times a day */,
    },
    'decrease_budget-percentage': {
      show: ['campaign', 'adset'],
      value: 'decrease_budget-percentage',
      label: 'Decrease %entity% budget by (%)',
      showWarning: true /* show a warning for decrease budget multiple times a day */,
    },
    pause: {
      show: ['campaign', 'adset', 'ad'],
      value: 'pause',
      label: 'Pause %entity%',
    },
    start: {
      show: ['campaign', 'adset', 'ad'],
      value: 'start',
      label: 'Start %entity%',
    },
};

const statusActions = ['pause', 'start'] as const;
const budgetActions = ['increase_budget', 'decrease_budget'] as const;
const evaluations = ['increase', 'decrease'] as const;
const strategyActions = ['increase_bid_cap', 'increase_cost_per_goal', 'decrease_bid_cap', 'decrease_cost_per_goal'] as const;
const bidStrategyTypes = ['LOWEST_COST_WITH_BID_CAP', 'COST_CAP', 'LOWEST_COST_WITHOUT_CAP'] as const;
const scopes = ['account', 'campaign', 'adset', 'ad'] as const;

export type StatusAction = typeof statusActions[number];
export type BudgetAction = typeof budgetActions[number];
export type StrategyAction = typeof strategyActions[number];
export type Scope = typeof scopes[number];
export type Evaluation = typeof evaluations[number];
export type BidStrategyType = typeof bidStrategyTypes[number];
export type RuleActions = StatusAction | BudgetAction | StrategyAction;

export function isBudgetAction(action: StatusAction | BudgetAction | StrategyAction): action is BudgetAction {
  return budgetActions.includes(action as BudgetAction);
}

export function isStatusAction(action: StatusAction | BudgetAction | StrategyAction): action is StatusAction {
  return statusActions.includes(action as StatusAction);
}

export function isStrategyAction(action: StatusAction | BudgetAction | StrategyAction): action is StrategyAction {
  return strategyActions.includes(action as StrategyAction);
}

export type ActionParams = {
  shop: string;
  ruleId: string;
  action: StatusAction | BudgetAction | StrategyAction;
  scope: Scope;
  id: string;
  value?: number;
  valueType?: 'percentage';
  auditId: string;
  mode?: 'exec' | 'logOnly';
  emittedAt: number;
  frequency?: string;
  testIndex?: boolean;
};

export type ActionResult = ActionParams & { status: 'success' | 'error'; message: string };
