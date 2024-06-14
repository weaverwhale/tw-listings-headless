import { AmazonAccountMarketplaceIds } from './AmazonMarketplace';
import { AmazonRegions } from './AmazonMarketplaces';

export type AmazonAccount = {
  selling_partner_id: string;
  refresh_token: string;
  region: AmazonRegions;
  ads_refresh_token: string;
  // tw_account_ids: string[];
  marketplace_ids: AmazonAccountMarketplaceIds;
  marketplace_ids_to_import: string[];
  tw_account_ids: {
    [key in string]: {
      tw_account_id: string;
      marketplace_ids: string[];
    };
  };
};
