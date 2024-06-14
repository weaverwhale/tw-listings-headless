import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const inventoryForecastingRows = (
  products: any[],
  isScaled: boolean,
  hasMoreProducts: boolean = false,
  openAll: boolean = false
): ForecastingRow[] => {
  const productsToDisplay = products.filter((prod) => {
    return prod.id !== 'all_products';
  });
  return [
    {
      name: 'Orders',
      collapsable: false,
      key: 'all_products.product_orders_count',
      level: 1,
      type: 'count',
    },
    {
      name: 'Average line items/order',
      key: 'custom.avg_line_items_per_order',
      customKeyFunction: 'divide',
      customKey: true,
      customKeyData: {
        top: 'all_products.product_total_quantity',
        bottom: 'all_products.product_orders_count',
      },
      type: 'count',
      collapsable: false,
      level: 1,
    },
    {
      name: 'Mix',
      collapsable: true,
      key: 'all_products.product_catalog_ratio_mix_by_quantity',
      level: 1,
      type: 'ratio',
      children: [
        {
          key: 'search',
          name: 'Search',
          level: 2,
          collapsable: false,
          hidden: openAll,
          type: 'count',
        },
        ...productsToDisplay.map(
          (prod): ForecastingRow => ({
            level: 2,
            name: prod.title,
            key: `${prod.id}.product_catalog_ratio_mix_by_quantity`,
            type: 'ratio',
            collapsable: prod?.num_variants > 1,
            isParentProductRow: true,
            children:
              prod?.num_variants > 1
                ? prod.variants
                  ? prod.variants.map((v: any) => ({
                      key: `${v.id}.product_catalog_ratio_mix_by_quantity`,
                      level: 3,
                      name: v.title,
                    }))
                  : [{ level: 3, name: '', key: 'spinner', type: 'count' }]
                : null,
          })
        ),
        {
          name: 'Pagination',
          key: 'pagination',
          level: 2,
          type: 'count',
          collapsable: false,
          hidden: openAll || !hasMoreProducts,
        },
      ],
    },
    {
      name: 'Revenue',
      collapsable: true,
      type: 'money',
      key: isScaled
        ? 'all_products.product_total_revenue_scaled'
        : 'all_products.product_total_revenue',
      level: 1,
      children: [
        {
          name: 'Search',
          key: 'search',
          type: 'count',
          level: 2,
          collapsable: false,
        },
        ...productsToDisplay.map(
          (prod): ForecastingRow => ({
            level: 2,
            name: prod.title,
            key: isScaled
              ? `${prod.id}.product_total_revenue_scaled`
              : `${prod.id}.product_total_revenue`,
            collapsable: prod?.num_variants > 1,
            isParentProductRow: true,
            type: 'money',
            children:
              prod?.num_variants > 1
                ? prod.variants
                  ? prod.variants.map((v: any) => ({
                      key: isScaled
                        ? `${v.id}.product_total_revenue_scaled`
                        : `${v.id}.product_total_revenue`,
                      level: 3,
                      name: v.title,
                    }))
                  : [{ level: 3, name: '', key: 'spinner', type: 'count' }]
                : null,
          })
        ),
        {
          type: 'count',
          key: 'pagination',
          name: 'Pagination',
          level: 2,
          collapsable: false,
          hidden: openAll || !hasMoreProducts,
        },
      ],
    },
    {
      name: 'Gross Units',
      collapsable: true,
      level: 1,
      key: 'all_products.product_total_quantity',
      type: 'count',
      children: [
        {
          name: 'Search',
          key: 'search',
          level: 2,
          collapsable: false,
          type: 'count',
        },
        ...productsToDisplay.map(
          (prod): ForecastingRow => ({
            level: 2,
            key: `${prod.id}.product_total_quantity`,
            name: prod.title,
            collapsable: prod?.num_variants > 1,
            isParentProductRow: true,
            type: 'count',
            children:
              prod?.num_variants > 1
                ? prod.variants
                  ? prod.variants.map((v: any) => ({
                      level: 3,
                      key: `${v.id}.product_total_quantity`,
                      name: v.title,
                    }))
                  : [{ type: 'count', level: 3, name: '', key: 'spinner' }]
                : null,
          })
        ),
        {
          type: 'count',
          name: 'Pagination',
          key: 'pagination',
          level: 2,
          collapsable: false,
          hidden: openAll || !hasMoreProducts,
        },
      ],
    },
    {
      name: 'Days of Stock',
      collapsable: true,
      key: 'all_products.stock_level_days',
      level: 1,
      type: 'count',
      children: [
        {
          type: 'count',
          name: 'Search',
          key: 'search',
          level: 2,
          collapsable: false,
        },
        ...productsToDisplay.map(
          (prod): ForecastingRow => ({
            level: 2,
            name: prod.title,
            type: 'count',
            collapsable: prod?.num_variants > 1,
            isParentProductRow: true,
            key: `${prod.id}.stock_level_days`,
            children:
              prod?.num_variants > 1
                ? prod.variants
                  ? prod.variants.map((v: any) => ({
                      level: 3,
                      key: `${v.id}.stock_level_days`,
                      name: v.title,
                    }))
                  : [{ type: 'count', level: 3, name: '', key: 'spinner' }]
                : null,
          })
        ),
        {
          type: 'count',
          name: 'Pagination',
          key: 'pagination',
          level: 2,
          collapsable: false,
          hidden: openAll || !hasMoreProducts,
        },
      ],
    },
  ];
};
