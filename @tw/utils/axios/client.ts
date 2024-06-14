import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { httpAgent, httpsAgent, keepAliveAgent, keepAliveHttpsAgent } from '../dns';
import { logger } from '../logger';
import { isLocal } from '@tw/constants';

const defaultTimeout = process.env.TW_OUTBOUND_REQUEST_TIMEOUT_MS
  ? parseInt(process.env.TW_OUTBOUND_REQUEST_TIMEOUT_MS)
  : undefined;

export const axiosInterceptors = {
  request: [],
  response: [],
};

export function getAxiosClient(
  args: {
    axiosRetryConfig?: IAxiosRetryConfig;
    keepAlive?: boolean;
    axiosOptions?: CreateAxiosDefaults;
  } = {}
): AxiosInstance {
  const { axiosRetryConfig, keepAlive, axiosOptions } = args;
  const options: CreateAxiosDefaults = {
    httpsAgent,
    httpAgent,
    timeout: defaultTimeout,
    ...axiosOptions,
  };

  if (keepAlive) {
    options.httpsAgent = keepAliveHttpsAgent;
    options.httpAgent = keepAliveAgent;
  }
  const client = axios.create(options);
  for (const interceptor of axiosInterceptors.request) {
    client.interceptors.request.use(interceptor);
  }
  for (const interceptor of axiosInterceptors.response) {
    client.interceptors.response.use(interceptor);
  }

  axiosRetry(client, {
    onRetry: (retryCount, error, requestConfig) => {
      logger.error(
        `axiosRetry: doing retry ${retryCount} on error: ${error}, url: ${requestConfig.url}`
      );
    },
    retries: isLocal ? 0 : 3,
    retryCondition: (error) => {
      return (
        [408, 429, 502, 503, 504].includes(error?.response?.status) || error?.code === 'ECONNRESET'
      );
    },
    ...axiosRetryConfig,
  });

  return client;
}
