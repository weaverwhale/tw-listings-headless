import { cohortRecaptureForecastingRow } from './views/cohortRecapture';
import { channelForecastingRows } from './views/channel';
import { cohortForecastingRows } from './views/cohort';
import { inventoryForecastingRows } from './views/inventory';
import { ForecastingRow } from '@tw/types/module/forecasting/Forecasting';
import { inventoryRevenueForecastingRows } from './views/inventoryRevenue';
import { inventoryUnitsForecastingRows } from './views/inventoryUnits';
import { inventoryDaysOfStockForecastingRows } from './views/inventoryDaysOfStock';

export const forecastingRows = (
  products: any[],
  isScaled: boolean,
  openAll: boolean,
  view: string | null = null,
  hasMoreProducts: boolean = false,
  adsServicesToDisplay: any[] = []
): ForecastingRow[] => {
  if (view === 'cohort') {
    return cohortForecastingRows(adsServicesToDisplay);
  } else if (view === 'channel') {
    return channelForecastingRows(adsServicesToDisplay);
  } else if (view === 'inventory_revenue' || view === 'inventory_collection_revenue') {
    return inventoryRevenueForecastingRows(products, isScaled, hasMoreProducts, openAll);
  } else if (view === 'inventory_units' || view === 'inventory_collection_units') {
    return inventoryUnitsForecastingRows(products, hasMoreProducts, openAll);
  } else if (view === 'inventory_days_of_stock') {
    return inventoryDaysOfStockForecastingRows(products, hasMoreProducts, openAll);
  } else {
    return [
      ...cohortForecastingRows(adsServicesToDisplay),
      ...channelForecastingRows(adsServicesToDisplay),
      ...inventoryForecastingRows(products, isScaled, hasMoreProducts, openAll),
    ];
  }
};
