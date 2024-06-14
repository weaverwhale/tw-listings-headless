export const UserRoles = [
  'ad_buyer',
  'agency_owner',
  'brand_owner',
  'marketing_manager',
  'retention_marketer',
  'operations',
  'finance_accounting',
  'Inventory_supply_chain',
] as const;

export type UserRolesTypes = typeof UserRoles[number];
