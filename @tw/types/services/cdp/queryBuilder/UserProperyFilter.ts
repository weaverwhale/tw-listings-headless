import { FilterProperty } from "../../insights";
import { QueryFilterProperty, CDPSegmentFilterType } from "./SegmentFilter"


export const USER_PROPERTIES = [
  FilterProperty.CUSTOMER_NAME,
  FilterProperty.CUSTOMER_ADDRESS_CITY,
  FilterProperty.CUSTOMER_ADDRESS_STATE,
  FilterProperty.CUSTOMER_ADDRESS_COUNTRY,
  FilterProperty.CUSTOMER_EMAIL,
  FilterProperty.CUSTOMER_TOTAL_ORDERS_NUMBER,
  FilterProperty.CUSTOMER_TAG,
  FilterProperty.CUSTOMER_ACTIVE_SUBSCRIPTIONS_NUMBER,
];

export type CDPUserProperty = (typeof USER_PROPERTIES)[number];

export type CDPUserPropertyFilter = {
  type: CDPSegmentFilterType.USER_PROPERTY,
  definition: {
    property: QueryFilterProperty<CDPUserProperty>,
  }
}