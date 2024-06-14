import { FilterProperty, NumberComparator } from '../../insights';
import { QueryFilterProperty, CDPSegmentFilterType } from './SegmentFilter';
import { TimeFilter } from './TimeFilter';

export enum CDPActionFilterActions {
  MADE_PURCHASE = 'made_purchase',
  CLICKED_AD = 'clicked_ad',
  VISITED_URL = 'visited_url',
  STARTED_SUBSCRIPTION = 'started_subscription',
  UPDATED_SUBSCRIPTION = 'updated_subscription',
  CANCELLED_SUBSCRIPTION = 'cancelled_subscription',
}

const ACTION_PROPERTIES = [
  FilterProperty.PRODUCT_ID,
  FilterProperty.PRODUCT_NAME,
  FilterProperty.ORDER_TAG,
  FilterProperty.ORDER_PRICE,
  FilterProperty.ORDER_ITEMS,
  FilterProperty.ORDER_DISCOUNT_CODE,
  FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_ID,
  FilterProperty.ATTRIBUTION_ADS_CAMPAIGN_NAME,
  FilterProperty.ATTRIBUTION_ADS_ADSET_ID,
  FilterProperty.ATTRIBUTION_ADS_ADSET_NAME,
  FilterProperty.ATTRIBUTION_ADS_AD_ID,
  FilterProperty.ATTRIBUTION_ADS_AD_NAME,
  FilterProperty.ATTRIBUTION_SOURCE,
  FilterProperty.ATTRIBUTION_URL_PATH,
];

export type CDPActionProperty = (typeof ACTION_PROPERTIES)[number];

export enum CDPActionPrsoperty {
  AD_GROUP_NAME = 'ad_group_name',
  AD_GROUP_ID = 'ad_group_id',
  AD_NAME = 'ad_name',
  AD_ID = 'ad_id',
  SOURCE = 'source',
  URL_PATH = 'url_path',
  DISCOUNT_CODE = 'discount_code',
}

export type CDPActionFilter = {
  type: CDPSegmentFilterType.ACTION;
  definition: {
    action: {
      type: CDPActionFilterActions;
      comparator: NumberComparator;
      value: number;
    };
    time: TimeFilter;
    property?: QueryFilterProperty<CDPActionProperty>;
  };
};
