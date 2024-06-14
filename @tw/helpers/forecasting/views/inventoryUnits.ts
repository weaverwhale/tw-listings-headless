import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const inventoryUnitsForecastingRows = (
  products: any[],
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
  ];
};
