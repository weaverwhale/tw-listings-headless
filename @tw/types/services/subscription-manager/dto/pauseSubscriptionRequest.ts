export declare type pauseSubscriptionRequest = {
  reason?: string; //reason selected from dropdown list for pause
  shopNotes?: string; //whatever additional notes CS wants to add !!!! it overwrites current shop notes !!!
  resumesAt?: Date; // date to re-enable invoice charging
  explanation?: String; //explanation for pause
};
