import { ServicesIds } from "../general";

export enum CustomerActivityType {
  PlacedOrder = 'placed_order',
  AddedToCart = 'added_to_cart',
  RemovedFromCart = 'removed_from_cart',
  ClickedOnAd = 'clicked_on_ad',
  ClickedEmailSMSCampaign = 'clicked_email_sms_campaign',
  ViewedPage = 'viewed_page',
  PostPurchaseSurveySubmitted = 'post_purchase_survey_submitted',
  StartedSubscription = 'started_subscription',
}

export type OrderProps = {
  providerId: ServicesIds;
  orderId: string;
  orderName: string;
  orderPrice: number;
  discount: number;
  discountCode: string[];
  itemsPurchased: (ProductProps & { quantity: number })[];
  orderTags: string[];
  fulfillmentStatus: 'fulfilled' | 'partial' | 'unfulfilled';
}

export type ProductProps = {
  productTitle: string;
  variantTitle: string;
  sku: string;
  imgUrl: string;
  price: number;
}

export type CartActionProps = ProductProps & {
  providerId: ServicesIds;
  quantity: number;
}

export type AdProps = {
  source: ServicesIds;
  campaignName: string;
  adSetName: string;
  adName: string;
  adImgUrl?: string;
}

export type ViewdPageProps = {
  pageType?: 'collection' | 'product' | 'cart' | 'confirmation',
  url: string;
  fullUrl?: string;
  title?: string;
  referrer?: string;
} & Partial<AdProps> & Partial<ProductProps>

export type PPSProps = {
  questions: {
    question: string;
    answer: string;
  }[];
}

export type SubscriptionProps = {
  providerId: ServicesIds;
  productName: string;
  orderPrice: number;
  orderIntervalUntis: 'week' | 'month' | 'day';
  orderIntervalValue: number;
}

export type EmailSMSCampaignProps = {
  source: ServicesIds;
  campaignName: string;
};

export type ActivityProperties = {
  [CustomerActivityType.PlacedOrder]: OrderProps;
  [CustomerActivityType.AddedToCart]: CartActionProps;
  [CustomerActivityType.RemovedFromCart]: CartActionProps;
  [CustomerActivityType.ClickedOnAd]: AdProps;
  [CustomerActivityType.ClickedEmailSMSCampaign]: EmailSMSCampaignProps;
  [CustomerActivityType.ViewedPage]: ViewdPageProps;
  [CustomerActivityType.PostPurchaseSurveySubmitted]: PPSProps;
  [CustomerActivityType.StartedSubscription]: SubscriptionProps;
};

export type CustomerActivity = {
  eventDate: string;
} & { [key in CustomerActivityType]: { type: key; properties: ActivityProperties[key] } }[CustomerActivityType]

export type CustomerActivityParams = {
  shopId: string;
  shopifyCustomerId: string;
  tripleIds?: string[];
  startDate: string;
  endDate: string;
}
