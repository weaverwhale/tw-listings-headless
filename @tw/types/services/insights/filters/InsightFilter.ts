import { FilterComparator } from './FilterComparator';
import { FilterProperty } from './FilterProperty';

export enum FilterTimeUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export type InsightsFilterCondition = {
  comparator: FilterComparator;
  value?: any;
  value1?: any;
  value2?: any;
  unit?: FilterTimeUnit;
  property: FilterProperty;
};

export type InsightsFilterQuery = InsightsFilterCondition[];

export type InsightsFilter = {
  id: string;
  name: string;
  query: InsightsFilterQuery;
  relationOperator: 'AND' | 'OR';
};
