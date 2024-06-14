export const MainTypesArr = ['provider_account', 'report', 'dashboard', 'cost', 'theme'] as const;

export type MainActionTypes = (typeof MainTypesArr)[number];
export const mainActionsDict: Record<
  MainActionTypes,
  { id: MainActionTypes; description: string }
> = {
  provider_account: {
    id: 'provider_account',
    description:
      'Connect or disconnect to Provider/integration account, and retrieve the connection information',
  },
  report: {
    id: 'report',
    description: 'Create/Edit email report or google sheet report',
  },
  dashboard: {
    id: 'dashboard',
    description: 'Create/Edit/Delete a Dashboard',
  },
  cost: {
    id: 'cost',
    description:
      'Retrieve/Create/Edit/Delete a Cost (like COGS, gateway, shipping, custom expenses)',
  },
  theme: {
    id: 'theme',
    description: 'Change the app theme (like dark mode, light mode)',
  },
};

export type MainActionTypesWithUnknown = MainActionTypes | 'unknown' | 'general';

export type MainActionResult = {
  mainActionType: MainActionTypesWithUnknown;
  error?: string;
  isNeedUserInteraction: boolean;
  data:
    | ReportsActionResult
    | CostActionResult
    | DashboardActionResult
    | ProviderActionResult
    | GenericActionResult
    | GeneralActionResult; // in case for general on main
};

export type GeneralActionResult = {
  providerType: MainActionTypesWithUnknown;
  error?: string;
  data: ChainData;
};

export type ChainData = {
  originalAnswer: string;
  chainSuccess: boolean;
  [key: string]: any;
};

export const ERROR_PREFIX = `error: `;
export const ERROR_PREFIX_PROMPT = `with this prefix: ${ERROR_PREFIX}`;

export type GenericActionResult = {
  error?: string;
  data: ChainData;
};

//Reports

export const ReportsActionTypesArr = ['create', 'edit', 'delete'] as const;

export type ReportsActionTypes = (typeof ReportsActionTypesArr)[number];
export const reportsActionsDict: Record<
  ReportsActionTypes,
  { id: ReportsActionTypes; description: string }
> = {
  create: {
    id: 'create',
    description: 'create a reports',
  },
  edit: {
    id: 'edit',
    description: 'edit or update a reports',
  },
  delete: {
    id: 'delete',
    description: 'delete a reports',
  },
};

export type ReportsActionTypesWithUnknown = ReportsActionTypes | 'unknown';

export type ReportsActionResult = {
  reportsType: ReportsActionTypesWithUnknown;
  error?: string;
  data: ChainData;
};

//cost

export const CostActionTypesArr = [
  'custom_expenses',
  'gateway_cost',
  'shipping_cost',
  'cogs',
] as const;

export type CostActionTypes = (typeof CostActionTypesArr)[number];
export const costActionsDict: Record<
  CostActionTypes,
  { id: CostActionTypes; description: string }
> = {
  custom_expenses: {
    id: 'custom_expenses',
    description: 'Custom Expenses',
  },
  gateway_cost: {
    id: 'gateway_cost',
    description: 'Gateway Cost',
  },
  shipping_cost: {
    id: 'shipping_cost',
    description: 'Shipping Cost',
  },
  cogs: {
    id: 'cogs',
    description: 'Cost of Goods (COGS)',
  },
};

export type CostActionTypesWithUnknown = CostActionTypes | 'unknown';

export type CostActionResult = {
  costType: CostActionTypesWithUnknown;
  crud: CRUDWithUnknownAction;
  error?: string;
  data: ChainData;
};

// CROUD

export const CRUDActionTypesArr = ['get', 'update', 'create', 'delete'] as const;

export type CRUDActionTypes = (typeof CRUDActionTypesArr)[number];
export const actionsDict: Record<CRUDActionTypes, { id: CRUDActionTypes; title: string }> = {
  get: {
    id: 'get',
    title: 'Get or Give me',
  },
  update: {
    id: 'update',
    title: 'Update or Edit',
  },
  create: {
    id: 'create',
    title: 'Add or Create',
  },
  delete: {
    id: 'delete',
    title: 'Delete or remove',
  },
};

export type CRUDWithUnknownAction = CRUDActionTypes | 'unknown';

//Dashboard

export const DashboardActionTypesArr = ['create', 'edit', 'delete'] as const;

export type DashboardActionTypes = (typeof DashboardActionTypesArr)[number];
export const dashboardActionsDict: Record<
  DashboardActionTypes,
  { id: DashboardActionTypes; description: string }
> = {
  create: {
    id: 'create',
    description: 'create a dashboard',
  },
  edit: {
    id: 'edit',
    description: 'edit or update a dashboard',
  },
  delete: {
    id: 'delete',
    description: 'delete a dashboard',
  },
};

export type DashboardActionTypesWithUnknown = DashboardActionTypes | 'unknown';

export type DashboardActionResult = {
  error?: string;
  dashboardType: DashboardActionTypesWithUnknown;
  data: ChainData;
};

//Provider

export const ProviderTypesArr = ['connect', 'disconnect', 'show', 'show-all'] as const;

export type ProviderActionTypes = (typeof ProviderTypesArr)[number];
export const ProviderActionsDict: Record<
  ProviderActionTypes,
  { id: ProviderActionTypes; description: string }
> = {
  connect: {
    id: 'connect',
    description: 'Connect to (like Facebook and Google) Account',
  },
  disconnect: {
    id: 'disconnect',
    description: 'Disconnect from provider (like Facebook and Google) account',
  },
  show: {
    id: 'show',
    description: 'Show the provider connection information (like the status, name etc)',
  },
  'show-all': {
    id: 'show-all',
    description: 'Show the list of all connected integrations.',
  },
};

export type ProviderActionTypesWithUnknown = ProviderActionTypes | 'unknown';

export type ProviderActionResult = {
  providerType: ProviderActionTypesWithUnknown;
  error?: string;
  data: ChainData;
};
