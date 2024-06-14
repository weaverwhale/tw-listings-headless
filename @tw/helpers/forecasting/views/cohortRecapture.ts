import {
  adsServices,
  returningCustomerSegmentTypes,
} from '@tw/constants/module/forecasting/Forecasting';
import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const cohortRecaptureForecastingRow = (adsServicesToDisplay: string[]): ForecastingRow[] => {
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
              // customKeyData: adsServicesToDisplay.map((id) => {
              //   return `New Customer.paid.${id}.total_price_attribution`;
              // }),
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
              name: 'Paid',
              collapsable: true,
              key: 'custom.Returning Customer.paid.All Paid Sources.conversion_value',
              customKeyFunction: 'sum',
              customKey: true,
              customKeyData: adsServicesToDisplay
                .map((id) => {
                  return [
                    `Newly Acquired Customer.paid.${id}.conversion_value`,
                    `Recently Acquired Customer.paid.${id}.conversion_value`,
                    `Non-Recently Acquired Active Customer.paid.${id}.conversion_value`,
                    `Reactivated.paid.${id}.conversion_value`,
                  ];
                })
                .flat(),
              type: 'money',
              level: 3,
              children: adsServicesToDisplay.map(
                (id): ForecastingRow => ({
                  level: 4,
                  name: adsServices[id].name,
                  isAdServiceParentRow: true,
                  adService: id,
                  collapsable: true,
                  key: `custom.paid.${id}.conversion_value`,
                  customKey: true,
                  type: 'money',
                  customKeyFunction: 'subtract',
                  customKeyData: [
                    `All Segments.paid.${id}.conversion_value`,
                    `New Customer.paid.${id}.conversion_value`,
                  ],
                  children: [
                    {
                      name: 'Ad Spend',
                      level: 5,
                      key: `custom.Returning Customer.paid.${id}.spend`,
                      collapsable: true,
                      customKey: true,
                      customKeyFunction: 'subtract',
                      customKeyData: [
                        `All Segments.paid.${id}.spend`,
                        `New Customer.paid.${id}.spend`,
                      ],
                      type: 'money',
                      children: returningCustomerSegmentTypes.map((s) => {
                        return {
                          name: s.title,
                          key: `${s.id}.paid.${id}.spend`,
                          type: 'money',
                          level: 6,
                        };
                      }),
                    },
                    {
                      name: 'ROAS',
                      key: `custom.Returning Customer.paid.${id}.reported_ROAS`,
                      collapsable: true,
                      customKey: true,
                      customKeyFunction: 'average',
                      customKeyData: [
                        `Newly Acquired Customer.paid.${id}.reported_ROAS`,
                        `Recently Acquired Customer.paid.${id}.reported_ROAS`,
                        `Non-Recently Acquired Active Customer.paid.${id}.reported_ROAS`,
                        `Reactivated.paid.${id}.reported_ROAS`,
                      ],
                      level: 5,
                      type: 'ratio',
                      children: returningCustomerSegmentTypes.map((s) => {
                        return {
                          name: s.title,
                          key: `${s.id}.paid.${id}.reported_ROAS`,
                          type: 'ratio',
                          level: 6,
                        };
                      }),
                    },
                    {
                      name: 'AOV',
                      key: `custom.Returning Customer.paid.${id}.aov_attribution`,
                      collapsable: true,
                      customKey: true,
                      customKeyFunction: 'average',
                      customKeyData: [
                        `Newly Acquired Customer.paid.${id}.aov_attribution`,
                        `Recently Acquired Customer.paid.${id}.aov_attribution`,
                        `Non-Recently Acquired Active Customer.paid.${id}.aov_attribution`,
                        `Reactivated.paid.${id}.aov_attribution`,
                      ],
                      level: 5,
                      type: 'money',
                      children: returningCustomerSegmentTypes.map((s) => {
                        return {
                          name: s.title,
                          key: `${s.id}.paid.${id}.aov_attribution`,
                          type: 'money',
                          level: 6,
                        };
                      }),
                    },
                    {
                      name: 'Customers',
                      key: `custom.Returning Customer.paid.${id}.purchases`,
                      collapsable: true,
                      customKey: true,
                      customKeyFunction: 'subtract',
                      customKeyData: [
                        `All Segments.paid.${id}.purchases`,
                        `New Customer.paid.${id}.purchases`,
                      ],
                      level: 5,
                      type: 'count',
                      children: returningCustomerSegmentTypes.map((s) => {
                        return {
                          name: s.title,
                          key: `${s.id}.paid.${id}.purchases`,
                          type: 'count',
                          level: 6,
                        };
                      }),
                    },
                    {
                      name: 'CPA',
                      key: `custom.Returning Customer.${id}.cpa`,
                      type: 'money',
                      collapsable: true,
                      customKeyFunction: 'divide',
                      customKeyData: {
                        top: {
                          customKeyFunction: 'subtract',
                          customKeyData: [
                            `All Segments.paid.${id}.spend`,
                            `New Customer.paid.${id}.spend`,
                          ],
                          type: 'money',
                        },
                        bottom: {
                          customKeyFunction: 'subtract',
                          customKeyData: [
                            `All Segments.paid.${id}.customer_cnt_attribution`,
                            `New Customer.paid.${id}.customer_cnt_attribution`,
                          ],
                          type: 'count',
                        },
                      },
                      customKey: true,
                      level: 5,
                      children: returningCustomerSegmentTypes.map((s) => {
                        return {
                          name: s.title,
                          key: `custom.${s.id}.paid.${id}.cpa`,
                          type: 'count',
                          customKey: true,
                          customKeyFunction: 'divide',
                          customKeyData: {
                            top: `${s.id}.paid.${id}.spend`,
                            bottom: `${s.id}.paid.${id}.customer_cnt_attribution`,
                          },
                          level: 6,
                        };
                      }),
                    },
                  ],
                })
              ),
            },
            {
              name: 'Organic',
              collapsable: true,
              key: `custom.Returning Customer.organic.organic.total_price_attribution`,
              customKey: true,
              customKeyFunction: 'subtract',
              customKeyData: [
                'All Segments.organic.organic.total_price_attribution',
                'New Customer.organic.organic.total_price_attribution',
              ],
              type: 'money',
              level: 3,
              children: [
                {
                  name: 'Pixel Unique Visitors',
                  customKey: true,
                  key: `custom.New Customer.organic.organic.new_visitor_count`,
                  level: 4,
                  type: 'count',
                },
                {
                  name: 'Pixel Conversion Rate',
                  customKey: true,
                  key: `custom.New Customer.organic.organic.nc_conversion_rate`,
                  level: 4,
                  type: 'ratio',
                },
                {
                  name: 'Pixel AOV',
                  key: `custom.Returing Customer.organic.organic.aov_attribution`,
                  level: 4,
                  customKey: true,
                  customKeyFunction: 'average',
                  customKeyData: [
                    'Newly Acquired Customer.organic.organic.aov_attribution',
                    'Recently Acquired Customer.organic.organic.aov_attribution',
                    'Non-Recently Acquired Active Customer.organic.organic.aov_attribution',
                    'Reactivated.organic.organic.aov_attribution',
                  ],
                  type: 'money',
                  collapsable: true,
                  children: returningCustomerSegmentTypes.map((s) => {
                    return {
                      name: s.title,
                      key: `${s.id}.organic.organic.aov_attribution`,
                      type: 'money',
                      level: 6,
                    };
                  }),
                },
                {
                  name: 'Pixel Customers',
                  key: `custom.Returning Customer.organic.organic.customer_cnt_attribution`,
                  level: 4,
                  type: 'count',
                  customKey: true,
                  customKeyFunction: 'subtract',
                  customKeyData: [
                    'All Segments.organic.organic.customer_cnt_attribution',
                    'New Customer.organic.organic.customer_cnt_attribution',
                  ],
                  collapsable: true,
                  children: returningCustomerSegmentTypes.map((s) => {
                    return {
                      name: s.title,
                      key: `${s.id}.organic.organic.customer_cnt_attribution`,
                      type: 'count',
                      level: 6,
                    };
                  }),
                },
              ],
            },
            {
              name: 'Other',
              collapsable: true,
              key: `custom.Returning Customer.other.other.total_price_attribution`,
              customKey: true,
              customKeyFunction: 'subtract',
              customKeyData: [
                'All Segments.other.other.total_price_attribution',
                'New Customer.other.other.total_price_attribution',
              ],
              type: 'money',
              level: 3,
              children: [
                {
                  name: 'Pixel Unique Visitors',
                  customKey: true,
                  key: `custom.Returning Customer.other.other.new_visitor_count`,
                  level: 4,
                  type: 'count',
                },
                {
                  name: 'Pixel Conversion Rate',
                  customKey: true,
                  key: `custom.Returning Customer.other.other.nc_conversion_rate`,
                  level: 4,
                  type: 'ratio',
                },
                {
                  name: 'Pixel AOV',
                  key: `custom.Returing Customer.other.other.aov_attribution`,
                  level: 4,
                  customKey: true,
                  customKeyFunction: 'average',
                  customKeyData: [
                    'Newly Acquired Customer.other.other.aov_attribution',
                    'Recently Acquired Customer.other.other.aov_attribution',
                    'Non-Recently Acquired Active Customer.other.other.aov_attribution',
                    'Reactivated.other.other.aov_attribution',
                  ],
                  type: 'money',
                  collapsable: true,
                  children: returningCustomerSegmentTypes.map((s) => {
                    return {
                      name: s.title,
                      key: `${s.id}.other.other.aov_attribution`,
                      type: 'money',
                      level: 6,
                    };
                  }),
                },
                {
                  name: 'Pixel Customers',
                  key: `custom.Returning Customer.other.other.customer_cnt_attribution`,
                  level: 4,
                  type: 'count',
                  customKey: true,
                  customKeyFunction: 'subtract',
                  customKeyData: [
                    'All Segments.other.other.customer_cnt_attribution',
                    'New Customer.other.other.customer_cnt_attribution',
                  ],
                  collapsable: true,
                  children: returningCustomerSegmentTypes.map((s) => {
                    return {
                      name: s.title,
                      key: `${s.id}.other.other.customer_cnt_attribution`,
                      type: 'count',
                      level: 6,
                    };
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
};
