import {
  adsServices,
  returningCustomerSegmentTypes,
  segmentedSegmentTypes,
} from '@tw/constants/module/forecasting/Forecasting';
import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const cohortForecastingRows = (adsServicesToDisplay: string[]): ForecastingRow[] => {
  return [
    {
      name: 'Total Revenue',
      collapsable: true,
      level: 1,
      key: 'All Segments.shop.shopify.total_revenue',
      type: 'money',
      children: [
        {
          name: 'New Customer Revenue',
          collapsable: true,
          key: 'New Customer.shop.shopify.total_revenue',
          level: 2,
          type: 'money',
          children: [
            {
              name: 'Paid',
              collapsable: true,
              key: 'New Customer.paid.All Paid Sources.conversion_value',
              // customKeyFunction: 'sum',
              // customKey: true,
              // customKeyData: adsServicesToDisplay.map(
              //   (id) => `New Customer.paid.${id}.total_price_attribution`
              // ),
              type: 'money',
              level: 3,
              children: adsServicesToDisplay.map((id) => ({
                level: 4,
                name: adsServices[id].name,
                isAdServiceParentRow: true,
                adServiceId: id,
                collapsable: true,
                key: `New Customer.paid.${id}.conversion_value`,
                type: 'money',
                children: [
                  {
                    name: 'Ad Spend',
                    level: 5,
                    key: `New Customer.paid.${id}.spend`,
                    type: 'money',
                  },
                  {
                    name: 'New Customer ROAS',
                    key: `New Customer.paid.${id}.reported_ROAS`,
                    level: 5,
                    type: 'ratio',
                  },
                  {
                    name: 'New Customer AOV',
                    key: `New Customer.paid.${id}.reported_aov`,
                    level: 5,
                    type: 'money',
                  },
                  {
                    name: 'New Customer Purchases',
                    key: `New Customer.paid.${id}.purchases`,
                    level: 5,
                    type: 'count',
                  },
                  {
                    name: 'New Customer CPA',
                    key: `custom.New Customer.${id}.cpa`,
                    type: 'money',
                    customKeyFunction: 'divide',
                    customKey: true,
                    customKeyData: {
                      top: `New Customer.paid.${id}.spend`,
                      bottom: `New Customer.paid.${id}.nc_customer_cnt_attribution`,
                    },
                    level: 5,
                  },
                ],
              })),
            },
            {
              name: 'Organic',
              collapsable: true,
              key: `New Customer.organic.organic.total_price_attribution`,
              type: 'money',
              level: 3,
              children: [
                {
                  name: 'Pixel New Unique Visitors',
                  key: `New Customer.organic.organic.new_visitor_count`,
                  level: 4,
                  type: 'count',
                },
                {
                  name: 'Pixel NC Conversion Rate',
                  key: `New Customer.organic.organic.nc_conversion_rate`,
                  level: 4,
                  type: 'ratio',
                },
                {
                  name: 'Pixel NC AOV',
                  key: `New Customer.organic.organic.nc_aov_attribution`,
                  level: 4,
                  type: 'money',
                },
                {
                  name: 'Pixel New Customers',
                  key: `New Customer.organic.organic.nc_customer_cnt_attribution`,
                  level: 4,
                  type: 'count',
                },
              ],
            },
            {
              name: 'Other',
              key: `New Customer.other.other.total_price_attribution`,
              type: 'money',
              collapsable: true,
              level: 3,
              children: [
                {
                  name: 'Pixel New Unique Visitors',
                  key: `New Customer.other.other.new_visitor_count`,
                  type: 'count',
                  level: 4,
                },
                {
                  name: 'Pixel NC Conversion Rate',
                  key: `New Customer.other.other.nc_conversion_rate`,
                  type: 'ratio',
                  level: 4,
                },
                {
                  name: 'Pixel NC AOV',
                  key: `New Customer.other.other.nc_aov_attribution`,
                  type: 'money',
                  level: 4,
                },
                {
                  name: 'Pixel New Customers',
                  key: `New Customer.other.other.nc_customer_cnt_attribution`,
                  level: 4,
                  type: 'count',
                },
              ],
            },
          ],
        },
        {
          name: 'Returning Customer Revenue',
          key: 'custom.Returning Customer.revenue',
          type: 'money',
          customKeyFunction: 'sum',
          customKey: true,
          customKeyData: returningCustomerSegmentTypes.map((s) => {
            return `${s.id}.shop.shopify.total_revenue`;
          }),
          collapsable: true,
          level: 2,

          children: [
            {
              name: 'Revenue By Segment',
              key: 'custom.Returning Customer.by_segment',
              type: 'money',
              customKeyFunction: 'sum',
              customKey: true,
              customKeyData: returningCustomerSegmentTypes.map((s) => {
                return `${s.id}.shop.shopify.total_revenue`;
              }),
              collapsable: true,
              level: 3,
              children: returningCustomerSegmentTypes.map((s) => {
                return {
                  name: s.title,
                  key: `${s.id}.shop.shopify.total_revenue`,
                  type: 'money',
                  level: 4,
                };
              }),
            },
            {
              name: 'Number of Customers',
              collapsable: true,
              level: 3,
              type: 'count',
              key: 'All Segments.shop.shopify.num_customers',
              children: segmentedSegmentTypes.map((s) => {
                return {
                  name: s.title,
                  key: `${s.id}.shop.shopify.num_customers`,
                  type: 'money',
                  level: 4,
                };
              }),
            },
            {
              name: 'Orders',
              collapsable: true,
              level: 3,
              type: 'count',
              key: 'All Segments.shop.shopify.order_cnt',
              children: segmentedSegmentTypes.map((s) => {
                return {
                  name: s.title,
                  key: `${s.id}.shop.shopify.order_cnt`,
                  type: 'money',
                  level: 4,
                };
              }),
            },
            {
              name: 'AOV',
              collapsable: true,
              key: 'All Segments.shop.shopify.aov',
              type: 'money',
              level: 3,
              children: segmentedSegmentTypes.map((s) => {
                return {
                  name: s.title,
                  key: `${s.id}.shop.shopify.aov`,
                  type: 'money',
                  level: 4,
                };
              }),
            },
            {
              name: 'Repeat Purchase Rates',
              key: 'All Segments.shop.shopify.purchase_rate',
              collapsable: true,
              type: 'ratio',
              level: 3,
              children: segmentedSegmentTypes.map((s) => {
                return {
                  name: s.title,
                  key: `${s.id}.shop.shopify.purchase_rate`,
                  type: 'money',
                  level: 4,
                };
              }),
            },
          ],
        },
      ],
    },
  ];
};
