import { FilterComparator as FilterComparatorType } from './services/insights/filters/FilterComparator';
import { FilterProperty } from './services/insights/filters/FilterProperty';

export type AggregationFunction = 'AVG' | 'COUNT' | 'SUM' | 'MAX' | 'MIN' | 'COUNT_DISTINCT';

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
}
export const EVENT_DATE = 'event_date';

type OptionsObj = {
  label: string;
  value: string;
};

export type SQLType = (typeof SQLTypeArray)[number];

export type BqColumn = {
  name: string; //name is the table real column name
  id: string;
  title: string;
  type: SQLType;
  autoCompleteKey?: FilterProperty;
  options?: OptionsObj[];
  getOptionsFunc?: (value: string) => OptionsObj[];
  multiSelect?: boolean;
  columns?: BqColumn[];
  selected?: boolean;
  expanded?: boolean;
  pivot?: boolean;
  agg?: AggregationFunction;
  relatedTable?: string[];
  comparators?: FilterComparatorType[];
  description?: string;
  aggFunction?: AggregationFunction;
};

export type FilterRow = {
  column: BqColumn;
  isReadOnly?: boolean;
  comparator?: FilterComparatorType;
  value?: any;
  value1?: any;
  value2?: any;
  unit?: any;
  isDeleted?: boolean;
};

export const SQLTypeArray = [
  'string',
  'numeric',
  'date',
  'timestamp',
  'boolean',
  'record repeated',
  'repeated string',
  'formula',
  'unknown',
  'parameter',
] as const;

export enum ElementTypes {
  OPERATOR = 'operator',
  INTEGER = 'integer',
  METRIC = 'metric',
  PARENTHESES = 'parentheses',
}

export type ExpressionElement = {
  // id: string;
  title: string;
  value?: any;
  type: ElementTypes;
  isSelected?: boolean;
};
