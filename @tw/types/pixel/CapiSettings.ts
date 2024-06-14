import { PixelBaseEvent, PixelEventType } from './PixelBaseEvent';

export const _capiSources = ['meta', 'klaviyo', 'tiktok'] as const;
export type CapiSources = typeof _capiSources[number];

export const _capiEvents = ['pageLoad', 'newSession', 'addToCart', 'purchase', 'viewContent', 'initiateCheckout', 'addPaymentInfo', 'search', 'signup', 'custom'] as const;
export type CapiEvents = typeof _capiEvents[number];

export type CapiEventsConfig = {
  [key in PixelEventType]: { type: CapiEvents, condition: (e: PixelBaseEvent<any, any>) => boolean, sources: CapiSources[] }[]
}

export type CapiSettings = Partial<{
  [key in CapiSources]: SourceCapiSettings
}>

export interface SourceCapiSettings {
  isEnabled: boolean;
  pixelId: string;
  accessToken: string;
  credentialsId?: string;
  events?: Partial<{ [key in CapiEvents]: boolean }>
  initialSubscriptionTags?: string[]
  recurringSubscriptionTags?: string[]
  exclusionTags?: string[]
  channelExclusionMethod?: string;
  customExclusionChannels?: { name: string, code: string }[];
  defaultExclusionChannels?: { name: string, code: string }[];
}

export type CapiEvent = {
  source: CapiSources,
  type: CapiEvents,
  event: PixelBaseEvent<any, any>
}
