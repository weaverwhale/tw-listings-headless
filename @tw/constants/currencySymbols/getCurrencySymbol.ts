import { currecySymbolsMap } from "./map.constant";

export const getCurrencySymbol = (currency: string): string => {
    return currecySymbolsMap[currency];
}