import { EndpointParams } from '@tw/types';
import { objectBool } from './bool';

export function generateEndpoint(endpoint: string, params: EndpointParams = {}): string {
  if (objectBool(params)) {
    endpoint += '?';
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        endpoint += `${key}=${encodeURIComponent(value as string)}&`;
      }
    }
    endpoint = endpoint.slice(0, -1); // remove trailing '&' character
  }
  return endpoint;
}
