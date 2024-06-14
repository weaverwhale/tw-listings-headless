import { Request } from 'express';

import { FirebaseUser, HydraApp } from '../../auth';

export type RequestWithUser = Request & { user: FirebaseUser | HydraApp | undefined };

export enum ConsentSubmitType {
  Accept,
  Deny,
}

export declare type RequestBodyWithUser<Body> = {
  body: Body;
} & RequestWithUser;

export declare type RequestNoSecurity<Body> = {
  body: Body;
} & Request;

export enum SupportedScopes {
  ADS_METRICS_READ = 'ads-metrics:read',
  ADS_METRICS_WRITE = 'ads-metrics:write',
  ATTRIBUTION_READ = 'attribution:read',
}

export declare type Oauth2CreateUpdateClient = {
  clientName: string;
  clientUri: string;
  tosUri?: string;
  redirectUris: string[];
  email?: string;
  phone?: string;
  scopes: SupportedScopes[];
  policyUri?: string;
  logoUri: string;
};

export declare type OauthRequest<Body> = {
  body: Body;
} & RequestWithUser;

export declare type Oauth2GetClientFilter = {
  limit?: number;
  clientName: string;
} & RequestWithUser;

export declare type Oauth2ConsentAccept = {
  scopes?: string[];
  shopId?: string;
  type?: ConsentSubmitType;
  error?: string;
  error_description?: string;
  clientId?: string;
  clientName?: string;
};

export const scopesCopy = (clientName): { [key in SupportedScopes]: string } => ({
  [SupportedScopes.ADS_METRICS_WRITE]: `Access metrics data in ${clientName} and display it in Triple Whale`,
  [SupportedScopes.ADS_METRICS_READ]: `Send metrics data to ${clientName} from your Triple Whale account`,
  [SupportedScopes.ATTRIBUTION_READ]: `Send attribution data to ${clientName} from your Triple Whale account`,
});
