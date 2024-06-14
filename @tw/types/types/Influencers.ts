export type Influencer = {
  id?: string;
  name: string;
  profile_photo?: { name: string; type: string; url: string };
  campaign: string;
  destination_url?: string;
  source?: string;
  tracking_url?: string;
  social_handle?: string;
  discount_code?: string;
  discount_value?: number;
  one_time_spend?: number;
  one_time_spend_date?: string;
  sales_percentage?: number;
  created_at?: string;
  creatives: Array<CreativeType>;
  is_auto_created?: boolean;
  shouldDelete?: boolean;
  expenses?: influencerExpense[];
  links?: links[];
};

export type links = {
  id: string;
  url?: string;
  campaign: string;
  source: string;
  link: string;
};
export type influencerExpense =
  | {
      id: string;
      type: 'time_based';
      amount: number;
      amount_type: 'currency';
      start: string;
      end: string | null;
      recurring: 'weekly' | 'monthly' | 'one_time';
      recurring_times: number;
    }
  | {
      id: string;
      type: 'order_based';
      amount: number;
      amount_type: 'percentage' | 'currency';
      start: string;
      end: string;
    };

export function isTimeBasedExpense(
  expense: influencerExpense
): expense is influencerExpense & { type: 'time_based' } {
  return expense.type === 'time_based';
}

export interface CreativeType {
  url: string;
  type: string;
  name?: string;
  thumbnail?: string;
}
