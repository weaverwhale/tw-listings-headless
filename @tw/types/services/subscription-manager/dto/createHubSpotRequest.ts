import { subscriptionType } from '../entities';

export declare type createHubSpotRequest = {
  email: string;
  shopDomain?: string;
  firstName?: string;
  lastName?: string;
  referrer?: string;
  phone?: string;
  accountType?: 'AGENCY' | 'BRAND';
  plans?: string[];
  revenue?: string;
  agencyUrl?: string;
  shopCount?: number;
  source?: 'INVITATION' | 'SIGNUP';
  agencyName?: string;
  contractType?: subscriptionType;
};
