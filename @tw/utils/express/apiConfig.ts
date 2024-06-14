import { ValidationError, ValidatorOptions, validateOrReject } from 'class-validator';
import { ServicesIds } from '@tw/types/module/services';
import { RateLimitConfig } from '@tw/types/module/devops';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { FirebaseClaim } from '@tw/types/module/auth';
import { OpenAPIV3 } from 'openapi-types';
import { logger } from '../logger';
import { checkUserAccessToResource, deny } from '../auth';
import { endpointWrapper } from '../api';
import { RequestWithUser } from './getExpressApp';
import { sensoryIntegrationService } from '@tw/types';
import { sensoryMaster } from '@tw/types';
import { sensoryCredentialService } from '@tw/types';

export type Interfaces = ('client' | 'public')[];

export type TwOperationObject = Partial<OpenAPIV3.OperationObject> & {
  'x-google-backend'?: any;
  'x-tw'?: {
    corsAllowAll?: boolean;
    websocket?: boolean;
    pathPrefix?: string;
    serviceId?: string;
    interfaces?: Interfaces;
    rateLimits?: string;
  };
};

export type OverwriteExternalPath = {
  path?: string;
  prefix?: string;
};

export type OpenApi = {
  interfaces?: Interfaces;
  security?: {
    hydra?: string[];
    firebase?: string[];
    apiKey?: string[];
    trendsFirebase?: string[];
    firebaseSession?: string[];
  };
  operation?: TwOperationObject;
  overwriteExternalPath?: OverwriteExternalPath;
  deployment?: string;
  websocket?: boolean;
  corsAllowAll?: boolean;
};

export type ServicesIdsWithSensory =
  | ServicesIds
  | typeof sensoryIntegrationService
  | typeof sensoryCredentialService
  | typeof sensoryMaster;

type AuthConfig = {
  serviceId: ServicesIdsWithSensory;
  accountIds: string | string[];
  relation?: string;
};

export type ApiConfigArgs<B = any, P = any, Q = any, R = any> = {
  body?: B;
  query?: Q;
  resBody?: R;
  validate?: boolean;
  openApi?: OpenApi;
  rateLimits?: RateLimitConfig;
  auth?: {
    serviceId: ServicesIdsWithSensory | ((req: Request<P, R, B, Q>) => ServicesIdsWithSensory);
    accountIds: (string | string[]) | ((req: Request<P, R, B, Q>) => string | string[]);
    relation?: string; // not implemented
  };
  authorization?:
    | (AuthConfig[] | AuthConfig)
    | ((req: Request<P, R, B, Q>) => AuthConfig | AuthConfig[]);
  validatorOptions?: ValidatorOptions;
  classTransformOptions?: ClassTransformOptions;
  logValidationErrors?: boolean;
  selfAuth?: boolean;
  requireClaims?: FirebaseClaim[];
  ignoreAdmin?: boolean;
};

export function apiConfig<B = any, P = any, Q = any, R = any>(
  args: ApiConfigArgs<B, P, Q, R>
): RequestHandler<P, R, B, Q> {
  const {
    validatorOptions = { whitelist: true },
    classTransformOptions,
    auth,
    validate = false,
    logValidationErrors,
    requireClaims,
    ignoreAdmin,
  } = args;

  const parts = ['body', 'query'].filter((k) => args[k]);
  args['parts'] = parts;
  args['authError'] =
    Object.keys(args.openApi?.security || {}).length &&
    !auth &&
    !args.authorization &&
    !requireClaims?.length &&
    !args.selfAuth;

  async function apiConfigMiddleware(req: Request<P, R, B, Q>, res: Response, next: NextFunction) {
    const errors = [];
    if (validate) {
      for (const part of parts) {
        try {
          const classObject = plainToInstance(
            args[part].constructor,
            req[part],
            classTransformOptions
          );
          await validateOrReject(classObject, validatorOptions);
        } catch (e) {
          logger.warn('failed validation');
          errors.push(...e);
        }
      }
    }
    if (!errors.length) {
      if (!req['user']) {
        return next();
      }
      if (requireClaims?.length) {
        for (const claim of requireClaims) {
          if (!req['user'][claim]) {
            return deny(res);
          }
        }
      }
      if (auth) {
        let serviceId = auth.serviceId;
        let accountIds = auth.accountIds;
        if (typeof serviceId === 'function') serviceId = serviceId(req);
        if (typeof accountIds === 'function') accountIds = accountIds(req);
        if (
          !(
            await checkUserAccessToResource(
              (req as any as RequestWithUser).user,
              serviceId,
              accountIds,
              {
                ignoreAdmin: ignoreAdmin,
              }
            )
          ).result
        ) {
          return deny(res);
        }
      } else if (args.authorization) {
        let authorization = args.authorization;
        if (typeof authorization === 'function') {
          const funcRes = authorization(req);
          authorization = Array.isArray(funcRes) ? funcRes : [funcRes];
        } else {
          if (!Array.isArray(authorization)) {
            authorization = [authorization];
          }
        }
        const results = await Promise.all(
          authorization.map(async (authConfig) => {
            return (
              await checkUserAccessToResource(
                (req as any as RequestWithUser).user,
                authConfig.serviceId,
                authConfig.accountIds,
                {
                  ignoreAdmin: ignoreAdmin,
                }
              )
            ).result;
          })
        );
        if (!results.every(Boolean)) {
          return deny(res);
        }
      }
      return next();
    }
    if (logValidationErrors) logger.warn(`validation errors: ${errors}`);
    const code = 400;
    return res.status(code).json({
      error: true,
      code,
      message: 'Validation failed',
      errors: formatClassValidatorErrors(errors),
    });
  }
  const func = endpointWrapper(apiConfigMiddleware);
  func['metadata'] = { args };

  return func;
}

export const formatClassValidatorErrors = (errors: ValidationError[]): string[] => {
  const formattedErrors = errors.map((error) => {
    if (error.children?.length) {
      return formatClassValidatorErrors(error.children)
        .concat(Object.values(error.constraints))
        .flat();
    }
    return Object.values(error.constraints);
  });
  return [].concat(...formattedErrors.flat());
};
