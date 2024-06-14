import { idGraphType } from './idGraphType';

export * from './requests';
export * from './idGraphType';

export type Source = 'klaviyo' | 'postscript' | 'attentive' | 'order' | 'page-load' | 'nip';

export type AddExternalEmailsPayload = Pick<idGraphType, '_id' | 'shop'> & {
  source: Source;
  sourceIds: string[];
};
