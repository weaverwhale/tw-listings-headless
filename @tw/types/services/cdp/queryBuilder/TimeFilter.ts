import { FilterComparator, FilterTimeUnit } from "../../insights"

export type OverAllTimeFilter = {
  comparator: FilterComparator.OVER_ALL_TIME
}

export type AbsoluteTimeFilter = {
  comparator: FilterComparator.BEFORE | FilterComparator.AFTER,
  value: Date,
}

export type RelativeUnitTimeFilter = {
  comparator: FilterComparator.UNDER | FilterComparator.OVER,
  value: number,
  unit: FilterTimeUnit
}

export type BetweenTimeFilter = {
  comparator: FilterComparator.BETWEEN,
  value1: Date,
  value2: Date
}

export type WithinTimeFilter = {
  comparator: FilterComparator.WITHIN,
  value1: number,
  value2: number,
  unit: FilterTimeUnit
}

export type TimeFilter = OverAllTimeFilter | RelativeUnitTimeFilter | BetweenTimeFilter | WithinTimeFilter;