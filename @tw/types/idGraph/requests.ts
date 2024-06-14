import { idValue } from './idGraphType';

export type mapIdsRequest = {
  shop: string;
  tripleIds?: idValue[];
  thids?: idValue[];
  emails?: idValue[];
  phones?: idValue[];
  customerIds?: idValue[];
  klaviyoIds?: idValue[];
  postscriptIds?: idValue[];
  attentiveIds?: idValue[];
  hasKlaviyoError?: number;
  isBackfill?: boolean;
  gid?: string;
};

export type klaviyoTestRequest = {
  shop: string;
  tripleId: string;
};

export type orderBackfillRequest = {
  shop: string;
  orderId: string;
  tripleId?: string;
  email?: string;
  phone?: string;
  customerId: string;
  orderDate: string;
};
