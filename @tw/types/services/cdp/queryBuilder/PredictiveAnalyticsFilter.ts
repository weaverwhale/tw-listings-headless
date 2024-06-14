import { CDPSegmentFilterType } from "./SegmentFilter"

export type CDPPredictiveAnalyticsFilter = {
  type: CDPSegmentFilterType.PREDICTIVE_ANALYTICS,
  definition: {
    property: {} // TODO
  }
}