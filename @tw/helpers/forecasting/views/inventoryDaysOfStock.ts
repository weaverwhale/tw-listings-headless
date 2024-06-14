import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';

export const inventoryDaysOfStockForecastingRows = (
  products: any[],
  hasMoreProducts: boolean = false,
  openAll: boolean = false
): ForecastingRow[] => {
  const productsToDisplay = products.filter((prod) => {
    return prod.id !== 'all_products';
  });
  return [
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
