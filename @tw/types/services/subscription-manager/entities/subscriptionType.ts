export enum subscriptionTypes {
  '12 Month Contract' = '12 Month Contract',
  Annual = 'Annual',
  Monthly = 'Monthly',
  Free = 'Free',
  Quarterly = 'Quarterly',
  Biennial = 'Biennial',
}

export declare type subscriptionType = keyof typeof subscriptionTypes;
