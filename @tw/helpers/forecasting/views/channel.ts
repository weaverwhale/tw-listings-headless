import { adsServices } from '@tw/constants/module/forecasting/Forecasting';
import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const channelForecastingRows = (adsServicesToDisplay: string[]): ForecastingRow[] => {
  return [
    {
      name: 'Total Revenue',
      collapsable: true,
      level: 1,
      key: 'All Segments.shop.shopify.total_revenue',
      type: 'money',
      children: [
        {
          name: 'Paid',
          collapsable: true,
          level: 2,
          key: 'All Segments.paid.All Paid Sources.conversion_value',
          type: 'money',
          children: adsServicesToDisplay.map((id) => {
            return {
              isAdServiceParentRow: true,
              adServiceId: id,
              name: adsServices[id].name,
              level: 3,
              key: `All Segments.paid.${id}.conversion_value`,
              type: 'money',
              collapsable: true,
              children: [
                {
                  name: 'New Customers',
                  level: 4,
                  key: `New Customer.paid.${id}.conversion_value`,
                  type: 'money',
                  collapsable: true,
                  children: [
                    {
                      name: 'Ad Spend',
                      level: 5,
                      key: `New Customer.paid.${id}.spend`,
                      type: 'money',
                    },
                    {
                      name: 'ROAs',
                      level: 5,
                      key: `New Customer.paid.${id}.reported_ROAS`,
                      type: 'ratio',
                    },
                    {
                      name: 'AOV',
                      level: 5,
                      key: `New Customer.paid.${id}.reported_aov`,
                      type: 'money',
                    },
                    {
                      name: 'Purchases',
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
                },
                {
                  name: 'Returning Customers',
                  level: 4,
                  key: `custom.Returning Customers.paid.${id}.conversion_value`,
                  category: 'revenue',
                  type: 'money',
                  customKey: true,
                  customKeyFunction: 'subtract',
                  customKeyData: [
                    `All Segments.paid.${id}.conversion_value`,
                    `New Customer.paid.${id}.conversion_value`,
                  ],
                  collapsable: true,
                  children: [
                    {
                      name: 'Ad Spend',
                      level: 5,
                      key: `custom.Returning Customer.paid.${id}.spend`,
                      customKey: true,
                      customKeyFunction: 'subtract',
                      customKeyData: [
                        `All Segments.paid.${id}.spend`,
                        `New Customer.paid.${id}.spend`,
                      ],
                      type: 'money',
                    },
                    {
                      name: 'ROAs',
                      level: 5,
                      key: `custom.Returning Customer.paid.${id}.reported_ROAS`,
                      customKey: true,
                      customKeyFunction: 'average',
                      customKeyData: [
                        `Newly Acquired Customer.paid.${id}.reported_ROAS`,
                        `Recently Acquired Customer.paid.${id}.reported_ROAS`,
                        `Non-Recently Acquired Active Customer.paid.${id}.reported_ROAS`,
                        `Reactivated.paid.${id}.reported_ROAS`,
                      ],
                      type: 'ratio',
                    },
                    {
                      name: 'AOV',
                      level: 5,
                      key: `custom.Returning Customer.paid.${id}.aov_attribution`,
                      customKey: true,
                      customKeyFunction: 'average',
                      customKeyData: [
                        `Newly Acquired Customer.paid.${id}.aov_attribution`,
                        `Recently Acquired Customer.paid.${id}.aov_attribution`,
                        `Non-Recently Acquired Active Customer.paid.${id}.aov_attribution`,
                        `Reactivated.paid.${id}.aov_attribution`,
                      ],
                      type: 'money',
                    },
                    {
                      name: 'Purchases',
                      key: `custom.Returning Customer.paid.${id}.purchases`,
                      customKey: true,
                      customKeyFunction: 'subtract',
                      customKeyData: [
                        `All Segments.paid.${id}.purchases`,
                        `New Customer.paid.${id}.purchases`,
                      ],
                      level: 5,
                      type: 'count',
                    },
                    {
                      name: 'CPA',
                      type: 'money',
                      key: `custom.Returning Customer.${id}.cpa`,
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
                    },
                  ],
                },
              ],
            };
          }),
        },
        {
          name: 'Organic',
          collapsable: true,
          level: 2,
          key: 'All Segments.organic.organic.total_price_attribution',
          type: 'money',
          children: [
            {
              name: 'New Customers',
              level: 3,
              key: `New Customer.organic.organic.total_price_attribution`,
              type: 'money',
              collapsable: true,
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
              name: 'Returning Customers',
              level: 3,
              type: 'money',
              key: `custom.Returning Customer.organic.organic.total_price_attribution`,
              customKey: true,
              customKeyFunction: 'subtract',
              customKeyData: [
                'All Segments.organic.organic.total_price_attribution',
                'New Customer.organic.organic.total_price_attribution',
              ],
              collapsable: true,
              children: [
                {
                  name: 'Pixel Unique Visitors',
                  customKey: true,
                  key: `custom.Returning Customer.organic.organic.new_visitor_count`,
                  level: 4,
                  type: 'count',
                },
                {
                  name: 'Pixel Conversion Rate',
                  customKey: true,
                  key: `custom.Returning Customer.organic.organic.nc_conversion_rate`,
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
                },
              ],
            },
          ],
        },
        {
          name: 'Other',
          collapsable: true,
          level: 2,
          key: 'All Segments.other.other.total_price_attribution',
          type: 'money',
          children: [
            {
              name: 'New Customers',
              level: 3,
              key: `New Customer.other.other.total_price_attribution`,
              type: 'money',
              collapsable: true,
              children: [
                {
                  name: 'Pixel New Unique Visitors',
                  key: `New Customer.other.other.new_visitor_count`,
                  level: 4,
                  type: 'count',
                },
                {
                  name: 'Pixel NC Conversion Rate',
                  key: `New Customer.other.other.nc_conversion_rate`,
                  level: 4,
                  type: 'ratio',
                },
                {
                  name: 'Pixel NC AOV',
                  key: `New Customer.other.other.nc_aov_attribution`,
                  level: 4,
                  type: 'money',
                },
                {
                  name: 'Pixel New Customers',
                  key: `New Customer.other.other.nc_customer_cnt_attribution`,
                  level: 4,
                  type: 'count',
                },
              ],
            },
            {
              name: 'Returning Customers',
              level: 3,
              type: 'money',
              key: `custom.Returning Customer.other.other.total_price_attribution`,
              customKey: true,
              customKeyFunction: 'subtract',
              customKeyData: [
                'All Segments.other.other.total_price_attribution',
                'New Customer.other.other.total_price_attribution',
              ],
              collapsable: true,
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
                },
              ],
            },
          ],
        },
      ],
    },
  ];
};
