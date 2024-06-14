import type momentType from 'moment-timezone';

const isBrowser = typeof window === 'object';

const compares = ['isAfter', 'isBefore', 'isBetween', 'isSame', 'from', 'to'];
const momentCache = {
  hit: 0,
  none: 0,
  tzhHit: 0,
  tzMiss: 0,
  relHit: 0,
  relMiss: 0,
  formatHit: 0,
  formatMiss: 0,
  comparesHit: 0,
  comparesMiss: 0,
};

if (isBrowser) {
  // @ts-ignore
  window.momentCache = momentCache;
  // @ts-ignore
  window.dataCaches = [];
}

export function createCached(moment: typeof momentType) {
  const cache: Record<string, moment.Moment> = {};
  try {
    // @ts-ignore
    window.dataCaches.push(cache);
  } catch {}
  if (!isBrowser) return moment;
  function momentCached(inp?: moment.MomentInput, strict?: boolean | undefined): moment.Moment {
    let mainKey: any = inp;
    let inpNotMoment = typeof inp === 'string' || inp instanceof Date;
    if (typeof inp === 'string') {
      mainKey = strInputCacheKey(inp);
      momentCache.hit++;
      if (cache[mainKey]) return cache[mainKey].clone();
    }
    if (!inp) {
      // get epoch time to rounded second using Date
      mainKey = new Date().getTime().toString().slice(0, -3);
    } else if (inp instanceof Date) {
      mainKey = String(inp.getTime().toString().slice(0, -3));
    }
    if (mainKey && inpNotMoment && cache[mainKey]) {
      momentCache.hit++;
      return cache[mainKey].clone();
    }
    const res = moment(...arguments);
    res.clone = () => momentCached(res);
    if (mainKey && inpNotMoment) {
      cache[mainKey] = res.clone();
    }

    function createCompareCache(compare: string) {
      // @ts-ignore
      const org = res[compare];
      function compareCache(): moment.Moment {
        const input = arguments[0];
        if (typeof input === 'string') {
          const key = strInputCacheKey(input);
          if (cache[key]) {
            momentCache.comparesHit++;
            arguments[0] = cache[key].clone();
          } else {
            momentCache.comparesMiss++;
          }
        }
        // @ts-ignore
        return org.call(res, ...arguments);
      }
      return compareCache;
    }

    compares.forEach((compare) => {
      // @ts-ignore
      res[compare] = createCompareCache(compare);
    });

    const format = res.format;
    // @ts-ignore
    res.format = (formatStr?: string | undefined) => {
      const key = `format_${momentValueKey(res)}_${formatStr}`;
      if (mainKey && formatStr && cache[key]) {
        momentCache.formatHit++;
        return cache[key];
      } else {
        momentCache.formatMiss++;
      }
      const formatRes = format.call(res, formatStr);
      if (mainKey && formatStr) {
        cache[key] = formatRes as any;
      }
      return formatRes;
    };
    return res;
  }

  // copy methods from moment
  Object.keys(moment).forEach((key) => {
    // @ts-ignore
    momentCached[key] = moment[key];
  });

  function strInputCacheKey(input: string) {
    // @ts-ignore
    return `${input}_${moment.defaultZone?.name || ''}` as string;
  }

  function momentValueKey(m: moment.Moment) {
    // @ts-ignore
    return `${m._d.getTime()}_${m._z?.name || ''}`;
  }
  return momentCached;
}
