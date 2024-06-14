export declare type cancelSubscriptionRequest = {
  primaryCancelReason?: string; //reason selected from primary dropdown list for cancel
  secondaryCancelReason?: string; //reason selected secondary from dropdown list for cancel
  shopNotes?: string; //whatever additional notes CS wants to add
  numInvoiceRefund?: number; //number of invoices to refund - this is not implemented yet, maybe needs a separate endpoint
  isCancelNow?:boolean; //cancel now, if not - cancel at the end of the period (billing cycle)
};
