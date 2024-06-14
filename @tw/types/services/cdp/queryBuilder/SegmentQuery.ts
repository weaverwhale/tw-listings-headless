import { CDPSegmentFilter } from "./SegmentFilter"

export type CDPSegmentQuery = {
  type: 'AND'
  filters: CDPSegmentQueryBlock[];
}

export type CDPSegmentQueryBlock = {
  type: 'OR',
  filters: CDPSegmentFilter[]
}