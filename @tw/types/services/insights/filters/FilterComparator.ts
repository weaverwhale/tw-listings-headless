import { FilterPropertyType } from './FilterProperty';

export enum FilterComparator {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  CONTAIN = 'contain',
  NOT_CONTAIN = 'not_contain',
  IS_IN = 'is_in',
  IS_NOT_IN = 'is_not_in',
  START_WITH = 'start_with',
  NOT_START_WITH = 'not_start_with',
  END_WITH = 'end_with',
  NOT_END_WITH = 'not_end_with',
  IS_SET = 'is_set',
  IS_NOT_SET = 'is_not_set',
  IS = 'is',
  IS_NOT = 'is_not',
  // Time Comparators
  OVER_ALL_TIME = 'over_all_time',
  WITHIN = 'within',
  BETWEEN = 'between',
  BEFORE = 'before',
  AFTER = 'after',
  UNDER = 'under',
  OVER = 'over',
  // AI
  TOP = 'top',
  ARRAY_CONTAINS = 'array_contains',
  ARRAY_NOT_CONTAINS = 'array_not_contains',
}

export const STRING_COMPARATORS: readonly FilterComparator[] = [
  FilterComparator.EQUAL,
  FilterComparator.NOT_EQUAL,
  FilterComparator.CONTAIN,
  FilterComparator.NOT_CONTAIN,
  FilterComparator.IS_IN,
  FilterComparator.IS_NOT_IN,
  FilterComparator.START_WITH,
  FilterComparator.NOT_START_WITH,
  FilterComparator.END_WITH,
  FilterComparator.NOT_END_WITH,
  FilterComparator.IS_SET,
  FilterComparator.IS_NOT_SET,
] as const;

export const NUMBER_COMPARATORS: readonly FilterComparator[] = [
  FilterComparator.GREATER_THAN,
  FilterComparator.LESS_THAN,
  FilterComparator.EQUAL,
  FilterComparator.NOT_EQUAL,
] as const;

export const TIME_COMPARATORS: readonly FilterComparator[] = [
  FilterComparator.OVER_ALL_TIME,
  FilterComparator.UNDER,
  FilterComparator.OVER,
  FilterComparator.WITHIN,
  FilterComparator.BETWEEN,
  FilterComparator.BEFORE,
  FilterComparator.AFTER,
] as const;

export const BOOLEAN_COMPARATOR: readonly FilterComparator[] = [FilterComparator.EQUAL] as const;

export const LIST_COMPARATORS: readonly FilterComparator[] = [
  FilterComparator.IS_IN,
  FilterComparator.IS_NOT_IN,
] as const;

export const FIELD_ARRAY_COMPARATORS: readonly FilterComparator[] = [
  FilterComparator.ARRAY_CONTAINS,
  FilterComparator.ARRAY_NOT_CONTAINS,
] as const;

export const COMPARATOR_BY_TYPE: { [key in FilterPropertyType]: readonly FilterComparator[] } = {
  [FilterPropertyType.STRING]: STRING_COMPARATORS,
  [FilterPropertyType.NUMBER]: NUMBER_COMPARATORS,
  [FilterPropertyType.TIME]: TIME_COMPARATORS,
  [FilterPropertyType.BOOLEAN]: BOOLEAN_COMPARATOR,
  [FilterPropertyType.LIST]: LIST_COMPARATORS,
  [FilterPropertyType.REPEATED_STRING]: FIELD_ARRAY_COMPARATORS,
};

export type StringComparator = (typeof STRING_COMPARATORS)[number];
export type BooleanComparator = (typeof BOOLEAN_COMPARATOR)[number];
export type NumberComparator = (typeof NUMBER_COMPARATORS)[number];
export type ListComparator = (typeof LIST_COMPARATORS)[number];
export type ArrayComparator = (typeof FIELD_ARRAY_COMPARATORS)[number];
