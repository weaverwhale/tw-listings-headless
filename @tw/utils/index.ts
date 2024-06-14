export * from './safeDivide';
export * from './toFixed';
export * from './distributeInteger';
export * from './toArray';
export * from './toHash';
export * from './escapeRegExp';
export * from './splitArrayToChunks';
export * from './hashString';
export * from './snapshotToArray';
export * from './pgConvertNamedParams';
export * from './mergeAndSumObjectNumbersOnly';
export * from './influencers';
export * from './generateDates';
export * from './aggregateMetrics';

console.warn(
  '\x1b[41m%s\x1b[0m',
  `
IMPORTS FROM @tw/utils ROOT IS NOT ALLOWED.
SEE HERE: https://triplewhale.slack.com/archives/C02KFGMFMS5/p1658947106459799
ALSO PLEASE DON'T ADD EXPORTS TO HERE ANYMORE - PLEASE.`
);
