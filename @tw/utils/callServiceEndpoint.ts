import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { IncomingHttpHeaders } from 'http';
import { isLocal } from '@tw/constants';
import { getBaseUrl } from './getBaseUrl';
import { logger } from './logger';
import { getAxiosClient } from './axios';
import { getIdToken } from './gcp';
import { IAxiosRetryConfig } from 'axios-retry';
import { getStoreKey } from './twContext';

export async function callServiceEndpoint<R = any, T = any>(
  serviceId: string,
  endpoint: string,
  params: T,
  options: {
    projectId?: string;
    method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
    headers?: Partial<IncomingHttpHeaders>;
    axiosRetryConfig?: IAxiosRetryConfig;
    log?: boolean;
    forceCloud?: boolean;
    bearerToken?: string;
    params?: any;
    deployment?: string;
    stack?: string;
    localPort?: number;
    keepAlive?: boolean;
    axiosInstance?: AxiosInstance;
    timeout?: number; // ms
  } = {}
): Promise<AxiosResponse<R, T>> {
  const {
    log = true,
    axiosRetryConfig,
    forceCloud,
    bearerToken,
    deployment,
    stack,
    axiosInstance,
    keepAlive = true,
    timeout,
  } = options;
  const local = isLocal && !forceCloud;
  const logParams = getStoreKey('logParams');
  const context = getStoreKey('context');
  const { baseUrl, audience } = await getBaseUrl(
    serviceId,
    options?.projectId || process.env.PROJECT_ID,
    {
      local,
      deployment,
      stack,
      localPort: options.localPort,
      useUfDeployment: context.uf,
    }
  );
  const client = axiosInstance || getAxiosClient({ axiosRetryConfig, keepAlive });
  const url = baseUrl + '/' + endpoint;
  const method = options?.method || 'POST';

  if (log)
    logger.info(
      `${isLocal ? new Date().toISOString() + ': ' : ''}requesting internal url: ${url} [${method}]`
    );

  try {
    const requestOptions: AxiosRequestConfig = {
      url,
      method,
      params: options.params || {},
      timeout,
    };
    if (method === 'GET') {
      requestOptions.params = options.params || params;
    } else {
      requestOptions.data = params;
    }

    if (isLocal && forceCloud) {
      requestOptions.params.forceCloud = 'true';
    }

    const addedHeaders: Partial<IncomingHttpHeaders> = {};
    if (logParams.shopId) addedHeaders['x-tw-shop-id'] = logParams.shopId;
    if (context.traceId) addedHeaders['X-Cloud-Trace-Context'] = context.traceId + '/0;o=1';
    if (context.uf) addedHeaders['x-tw-uf'] = 'true';
    if (context.req?.headers['referer']) addedHeaders['referer'] = context.req.headers['referer'];

    if (audience) {
      addedHeaders['authorization'] = `Bearer ${bearerToken || (await getIdToken(audience))}`;
    }

    if (!options.headers?.['user-agent']) {
      addedHeaders['user-agent'] = `${process.env.SERVICE_ID}/${process.env.TW_VERSION}`;
    }

    requestOptions.headers = {
      ...addedHeaders,
      'x-tw-service-id': process.env.SERVICE_ID,
      ...options.headers,
    };
    const response = await client.request<any, AxiosResponse<R, T>>(requestOptions);
    if (log) logger.info(`${isLocal ? new Date().toISOString() + ': ' : ''}done request to ${url}`);
    return response;
  } catch (err) {
    if (isLocal && err.code === '404') {
      logger.error(`Got 404 when trying to call ${serviceId}, Service might not be running`);
      return err;
    }
    logger.error(`callServiceEndpoint: Error calling ${url}`, isLocal ? '' : prettyAxiosError(err));
    throw err;
  }
}

function prettyAxiosError(err: AxiosError): any {
  let errObj: any;
  if (err.response) {
    errObj = {
      data: err.response.data,
      status: err.response.status,
      statusText: err.response.statusText,
      headers: err.response.headers,
      request: {
        url: err.response.config?.url,
        method: err.response.config?.method,
        headers: err.response.config?.headers,
        data: err.response.config?.data,
        params: err.response.config?.params,
      },
    };
    return errObj;
  } else if (err.request) {
    errObj = {
      request: err.request,
    };
  }
  return err.message;
}
