export * from './CheckAuthResponse';
export * from './CheckAuthRequest';
export * from './Spice';

export type AuthType = 'user' | 'app' | 'key';

export type FirebaseClaim = 'admin' | 'superadmin' | 'twDev' | 'twDashboardCreator' | 'twFF' | 'twSuperAdmin';

export type FirebaseUser = {
  admin?: boolean;
  iss: string;
  auth_time: number;
  user_id: string;
  email: string;
  email_verified: boolean;
  firebase: any;
} & JwtBase;

export type Auth0App = {
  azp: string;
  gty: string;
} & JwtBase;

export type HydraApp = {
  client_id: string;
  ext?: {
    claims?: {
      accountId?: string;
    };
  };
  iss: string;
  jti: string;
  nbf: string;
  scp: string[];
} & JwtBase;

export type JwtBase = {
  sub: string;
  aud: string | string[];
  iat: number;
  exp: number;
};
