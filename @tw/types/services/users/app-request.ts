import { SupportedScopes } from './oauth';

export declare type CreateAppRequest = {
  name: string;
  email: string;
  company: string;
  phone: string;
  logoUrl: string;
  tosUrl?: string;
  policyUrl?: string;
  appUrl: string;
  purpose: string;
  redirectUrls: string[];
  scopes: SupportedScopes[];
};

export declare type AppRequest = CreateAppRequest & {
  _id: string;
  status: AppRequestStatus;
  handledAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  statusActionReason: string;
};

export enum AppRequestStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  DECLINED = 'declined',
}
