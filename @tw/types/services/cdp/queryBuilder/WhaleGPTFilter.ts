import { CDPSegmentFilterType } from "./SegmentFilter";

export type CDPWhaleGPTFilter = {
  type: CDPSegmentFilterType.WHALE_GPT;
  definition: {
    id: string;
    question: string;
    query: string;
  };
};
