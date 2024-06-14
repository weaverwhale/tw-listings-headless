import { FilterProperty } from '../../insights';
import { CDPSegmentFilterType, FilterListProperty } from './SegmentFilter';

export const RFM_PROPERTIES = [
  FilterProperty.CUSTOMER_RFM_RECENCY,
  FilterProperty.CUSTOMER_RFM_FREQUENCY,
  FilterProperty.CUSTOMER_RFM_MONETARY,
] as const;

export type CDPRFMProperty = (typeof RFM_PROPERTIES)[number];

export type CDPRFMFilter = {
  type: CDPSegmentFilterType.RFM_SEGMENT;
  definition: {
    properties: FilterListProperty<CDPRFMProperty>[];
  };
};
