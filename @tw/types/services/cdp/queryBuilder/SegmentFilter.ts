import { BooleanComparator, ListComparator, NumberComparator, StringComparator } from '../../insights';
import { CDPActionFilter } from './ActionFilter';
import { CDPLookalikeFilter } from './LookalikeFilter';
import { CDPPredictiveAnalyticsFilter } from './PredictiveAnalyticsFilter';
import { CDPRFMFilter } from './RFMFilter';
import { CDPSegmentRelationFilter } from './SegmentRelationFilter';
import { CDPUserPropertyFilter } from './UserProperyFilter';
import { CDPWhaleGPTFilter } from './WhaleGPTFilter';

export enum CDPSegmentFilterType {
  ACTION = 'user_action',
  USER_PROPERTY = 'user_property',
  PREDICTIVE_ANALYTICS = 'predictive_analytics',
  SEGMENT_RELATION = 'segment_relation',
  RFM_SEGMENT = 'rfm_segment',
  LOOKALIKE = 'lookalike_segment',
  WHALE_GPT = 'whale_gpt',
}

export type FilterStringProperty<T> = {
  property: T;
  comparator: StringComparator;
  value: string | string[];
};

export type FilterNumberProperty<T> = {
  property: T;
  comparator: NumberComparator;
  value: number;
};

export type FilterListProperty<T> = {
  property: T;
  comparator: ListComparator;
  value: (string | number)[];
};

export type FilterBooleanProperty<T> = {
  property: T;
  comparator: BooleanComparator;
  value: string;
};

export type QueryFilterProperty<T> = FilterStringProperty<T> | FilterNumberProperty<T> | FilterListProperty<T> | FilterBooleanProperty<T>;

export type CDPSegmentFilter =
  | CDPUserPropertyFilter
  | CDPActionFilter
  | CDPSegmentRelationFilter
  | CDPPredictiveAnalyticsFilter
  | CDPRFMFilter
  | CDPLookalikeFilter
  | CDPWhaleGPTFilter;
