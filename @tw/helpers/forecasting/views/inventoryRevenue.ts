import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const inventoryRevenueForecastingRows = (
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
  ];
};
