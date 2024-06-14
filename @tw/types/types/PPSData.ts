export type PPSData = {
  id?: string;
  provider_id: 'shopify';
  provider_account: string;
  type: 'FAIRING' | 'KNO' | 'TW-survey';
  survey_id?: string;
  updated_at: string; // date
  currency: string;
  order_id: string;
  order_total: number;
  order_total_usd?: number;
  question: string;
  question_id: string;
  response: string;
  response_id: string;
  free_text_response?: string;
  response_date_time: string; // date
  source?: string;
  tw_service?: string;
  question_type?: 'custom' | 'standard';
  customer_email?: string;
  customer_id?: string;
  customer_phone?: string;
}
