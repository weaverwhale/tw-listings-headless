import { CDPSegmentFilterType } from "./SegmentFilter";

export type CDPLookalikeFilter = {
  type: CDPSegmentFilterType.LOOKALIKE;
  definition: {
    property: {
      value: string;
    };
  };
};
