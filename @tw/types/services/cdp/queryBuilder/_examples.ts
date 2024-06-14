import { FilterComparator, FilterProperty, FilterTimeUnit } from "../../insights"
import { CDPActionFilterActions } from "./ActionFilter"
import { CDPSegmentFilterType } from "./SegmentFilter"
import { CDPSegmentQuery } from "./SegmentQuery"


// example:
const complex_segment_query: CDPSegmentQuery = {
  type: 'AND',
  filters: [
    {
      type: 'OR',
      filters: [
        {
          type: CDPSegmentFilterType.USER_PROPERTY,
          definition: {
            property: {
              property: FilterProperty.CUSTOMER_TOTAL_ORDERS_NUMBER,
              comparator: FilterComparator.LESS_THAN,
              value: 5
            }
          }
        },
        {
          type: CDPSegmentFilterType.USER_PROPERTY,
          definition: {
            property: {
              property: FilterProperty.CUSTOMER_EMAIL,
              comparator: FilterComparator.END_WITH,
              value: "@gmail.com"
            }
          }
        }
      ]
    },
    {
      type: 'OR',
      filters: [
        {
          type: CDPSegmentFilterType.ACTION,
          definition: {
            action: {
              type: CDPActionFilterActions.MADE_PURCHASE,
              comparator: FilterComparator.GREATER_THAN,
              value: 5
            },
            time: {
              comparator: FilterComparator.UNDER,
              value: 2,
              unit: FilterTimeUnit.WEEK
            },
            property: {
              property: FilterProperty.ORDER_PRICE,
              comparator: FilterComparator.EQUAL,
              value: 100
            }
          }
        },
        {
          type: CDPSegmentFilterType.ACTION,
          definition: {
            action: {
              type: CDPActionFilterActions.CLICKED_AD,
              comparator: FilterComparator.GREATER_THAN,
              value: 5
            },
            time: {
              comparator: FilterComparator.OVER_ALL_TIME,
            },
            property: {
              property: FilterProperty.PRODUCT_NAME,
              comparator: FilterComparator.IS_IN,
              value: ['product 1', 'product 2']
            }
          }
        },
      ]
    },
    {
      type: 'OR',
      filters: [
        {
          type: CDPSegmentFilterType.ACTION,
          definition: {
            action: {
              type: CDPActionFilterActions.MADE_PURCHASE,
              comparator: FilterComparator.GREATER_THAN,
              value: 5
            },
            time: {
              comparator: FilterComparator.WITHIN,
              value1: 3,
              value2: 1,
              unit: FilterTimeUnit.DAY
            },
            property: {
              property: FilterProperty.PRODUCT_NAME,
              comparator: FilterComparator.START_WITH,
              value: 'Shoe'
            }
          }
        },
        {
          type: CDPSegmentFilterType.ACTION,
          definition: {
            action: {
              type: CDPActionFilterActions.CLICKED_AD,
              comparator: FilterComparator.GREATER_THAN,
              value: 5
            },
            time: {
              comparator: FilterComparator.BETWEEN,
              value1: new Date('2021-01-01'),
              value2: new Date('2022-01-01'),
            },
            property: {
              property: FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_ID,
              comparator: FilterComparator.START_WITH,
              value: 'Cool'
            }
          }
        }
      ]
    }
  ]
}

const rfm_loyal_query: CDPSegmentQuery = {
  type: 'AND',
  filters: [
    {
      type: 'OR',
      filters: [
        {
          type: CDPSegmentFilterType.RFM_SEGMENT,
          definition: {
            properties: [
              {
                property: FilterProperty.CUSTOMER_RFM_RECENCY,
                comparator: FilterComparator.IS_IN,
                value: [1, 2]
              },
              {
                property: FilterProperty.CUSTOMER_RFM_FREQUENCY,
                comparator: FilterComparator.IS_IN,
                value: [5]
              },
              {
                property: FilterProperty.CUSTOMER_RFM_MONETARY,
                comparator: FilterComparator.IS_IN,
                value: [1, 2, 3, 4, 5]
              }
            ]
          }
        },
      ]
    }
  ]
};
