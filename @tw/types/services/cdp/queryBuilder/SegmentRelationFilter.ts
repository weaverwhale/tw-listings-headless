import { FilterComparator } from '../../insights'
import { CDPSegmentFilterType } from './SegmentFilter'

export type CDPSegmentRelationFilter = {
  type: CDPSegmentFilterType.SEGMENT_RELATION,
  definition: {
    property: {
      value: string,
      comparator: FilterComparator.IS | FilterComparator.IS_NOT,
    } 
  }
}
