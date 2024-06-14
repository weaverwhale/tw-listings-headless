import { AttributionData } from './Attribution';
import { OrderStat } from './AttributionDoc';
import { Query } from './RawEvent';

export type AttributionModelNames =
  | `linear-v2`
  | `linearAll-v2`
  | `fullLastClick-v2`
  | `fullFirstClick-v2`
  | `lastPlatformClick-v2`;

export type NewAttributionField = {
  clickDate: string;
  model: AttributionModelNames;
  linearWeight: number;
} & AttributionData & { query?: Query };

export type AttributionWindowsField = {
  d1?: NewAttributionField;
  d7?: NewAttributionField;
  d14?: NewAttributionField;
  d28?: NewAttributionField;
} & NewAttributionField;

export type NewOrderAttributionDoc = {
  tripleId: string;
  sessionId?: string;
  stat: OrderStat;
  eventDate: string;
  shop: string;
  orderId: number | string;
  totalPrice: number;
  cogs: number;
  linearWeight: number;
  customerId: number;
  firstName: string;
  lastName: string;
  orderName: string;
  currency: string;
  notes?: string;
  docId: string;
  isPpSurveyDuplicate?: boolean;
  attributedFrom?: string;
  products?: number[];
  variants?: number[];
  fakeUtcDate?: string;
  utcOffset?: number;
  path?: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  eventVersion?: number;
  pixelVersion?: string;
} & NewAttributionField &
  AttributionWindowsField;
