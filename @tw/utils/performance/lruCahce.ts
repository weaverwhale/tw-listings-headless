import { LRUCache } from 'lru-cache';

export function createLruCache<T extends (...args: any[]) => any>(args: {
  options?: Partial<LRUCache.Options<any, any, any>>;
  func: T;
  encode: (...args: Parameters<T>) => string;
}) {
  const { options, func, encode } = args;
  const cache = new LRUCache({
    ttl: 5 * 60 * 1000, // 1 minute
    max: 10000,
    ttlAutopurge: false,
    ignoreFetchAbort: true,
    allowStaleOnFetchAbort: true,
    ...options,
  });
  const fetch = async (...args: Parameters<T>) => {
    const key = encode(...args);
    let res = cache.get(key);
    if (res) return res;
    res = await func(...args);
    cache.set(key, res);
    return res;
  };
  return { cache, fetch };
}
