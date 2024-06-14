import { AmazonRegions } from './AmazonMarketplaces';

export type AmazonMarketplace = {
  id: string;
  region: AmazonRegions;
  marketplace?: {
    countryCode: string;
    defaultCurrencyCode: string;
    defaultLanguageCode: string;
    domainName: string;
    id: string;
    name: string;
  } & any;
  participation?: any;
  profiles?: {
    region: AmazonRegions;
    countryCode: string;
    currencyCode: string;
    dailyBudget: number;
    profileId: string;
    timezone: string;
  }[];
};

export type AmazonAccountMarketplaceIds = {
  [key in string]: AmazonMarketplace;
};
