import CacheableLookup from '@tw/cacheable-lookup';

export const cacheable = new CacheableLookup();

import http from 'http';
import https from 'https';

export const httpAgent = new http.Agent({
  lookup: cacheable.lookup,
});

export const httpsAgent = new https.Agent({
  lookup: cacheable.lookup,
});

export const keepAliveAgent = new http.Agent({
  lookup: cacheable.lookup,
  keepAlive: true,
  noDelay: true,
});

export const keepAliveHttpsAgent = new https.Agent({
  lookup: cacheable.lookup,
  keepAlive: true,
  noDelay: true,
});

http.globalAgent = httpAgent;
https.globalAgent = httpsAgent;
