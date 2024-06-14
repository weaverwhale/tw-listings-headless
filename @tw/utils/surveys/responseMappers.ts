import { shopMetricsServices } from '@tw/types/module/types/ShopMetrics';

import { surveyResponseAtomicTokens, surveyResponseTokens } from './surveyResponseTokens';

interface responseRef {
  service: (typeof shopMetricsServices)[number];
  source: string;
  summaryPageService?: string;
}

const toServiceMap: Record<
  (typeof surveyResponseTokens)[number] | (typeof surveyResponseAtomicTokens)[number] | 'other',
  responseRef
> = {
  fb: { service: 'facebook-ads', source: 'facebook' },
  facebook: { service: 'facebook-ads', source: 'facebook' },
  google: { service: 'google-ads', source: 'google' },
  snapchat: { service: 'snapchat-ads', source: 'snapchat' },
  tiktok: { service: 'tiktok-ads', source: 'tiktok' },
  pinterest: { service: 'pinterest-ads', source: 'pinterest' },
  ig: { service: 'facebook-ads', source: 'instagram', summaryPageService: 'instagram-ads' },
  instagram: { service: 'facebook-ads', source: 'instagram', summaryPageService: 'instagram-ads' },
  youtube: { service: 'google-ads', source: 'youtube' },
  other: { service: 'other', source: 'other' },
  klaviyo: { service: 'klaviyo', source: 'klaviyo', summaryPageService: 'other' },
  relix: { service: 'other', source: 'relix' },
  email: { service: 'other', source: 'email' },
  jambase: { service: 'other', source: 'jambase' },
  podcast: { service: 'other', source: 'podcast' },
  bing: { service: 'bing', source: 'bing' },
  twitter: { service: 'twitter-ads', source: 'twitter' },
};

const foreignLangTokens = [
  { text: 'פייסבוק', token: 'facebook' },
  { text: 'גוגל', token: 'google' },
  { text: 'סנאפשאט', token: 'snapchat' },
  { text: 'סנאפצ׳אט', token: 'snapchat' },
  { text: 'סנאפצ׳ט', token: 'snapchat' },
  { text: 'טיקטוק', token: 'tiktok' },
  { text: 'פינטרסט', token: 'pinterest' },
  { text: 'אינסטגראם', token: 'instagram' },
  { text: 'אינסטאגרם', token: 'instagram' },
  { text: 'אינסטגרם', token: 'instagram' },
  { text: 'יוטיוב', token: 'youtube' },
  { text: 'טוויטר', token: 'twitter' },
  { text: 'בינג', token: 'bing' },
];

export function mapResponseToService(response: string): string {
  let token = findToken(response);
  return toServiceMap[token].service;
}

export function mapResponseToSource(response: string): string {
  let token = findToken(response);
  return toServiceMap[token].source;
}

export function mapSourceToSummaryService(source: string): string {
  return toServiceMap[source]?.summaryPageService || toServiceMap[source]?.service || 'other';
}

function findToken(response: string): string {
  const result = surveyResponseTokens.find((t) => {
    return response.toLowerCase().replace(/ /g, '').indexOf(t) >= 0;
  });
  if (result) return result;

  const atomicResult = surveyResponseAtomicTokens.find((t) => {
    let lcResp = response.toLowerCase();
    return (
      lcResp === t ||
      lcResp.startsWith(t + ' ') ||
      lcResp.endsWith(' ' + t) ||
      lcResp.indexOf(' ' + t + ' ') >= 0
    );
  });
  if (atomicResult) return atomicResult;

  const foreignLangResult = foreignLangTokens.find((t) => response.includes(t.text));

  return foreignLangResult?.token || 'other';
}
