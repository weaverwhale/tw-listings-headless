import { ServicesIds } from "../general";

export declare type SegmentSyncReq = {
  shopDomain: string;
  segmentId: string;
  providerId: ServicesIds;
  accountId?: string;
  market?: string;
  providerAudienceId?: string;
};

export declare type SegmentSyncRes = {
  err: boolean;
  msg: string;
};