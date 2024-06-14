export interface StripeMessageBody {
    id: string;
    object: string;
    account: string;
    api_version: Date;
    created: number;
    data: FullStripeOrder;
    livemode: boolean;
    pending_webhooks: number;
    request: {
        id: string;
        idempotency_key: string;
    };
    type: string;
}

export interface FullStripeOrder {
    object: {
        id: string;
        object: string;
        account_country: string;
        account_name: string;
        account_tax_ids: any;
        amount_due: number;
        amount_paid: number;
        amount_remaining: number;
        amount_shipping: number;
        application: string;
        application_fee_amount: string;
        attempt_count: number;
        attempted: boolean;
        auto_advance: boolean;
        automatic_tax: AutomaticTax;
        billing_reason: string;
        charge: string;
        collection_method: string;
        created: number;
        currency: string;
        custom_fields: any;
        customer: string;
        customer_address: string;
        customer_email: string;
        customer_name: string;
        customer_phone: string;
        customer_shipping: string;
        customer_tax_exempt: string;
        customer_tax_ids: any[];
        default_payment_method: string;
        default_source: string;
        default_tax_rates: any[];
        description: string;
        discount: Discount;
        discounts: string[];
        due_date: string;
        effective_at: string;
        ending_balance: string;
        footer: string;
        from_invoice: string;
        hosted_invoice_url: string;
        invoice_pdf: string;
        issuer: Issuer;
        last_finalization_error: string;
        latest_revision: string;
        lines: Lines;
        livemode: boolean;
        metadata: any;
        next_payment_attempt: number;
        number: string;
        on_behalf_of: string;
        paid: boolean;
        paid_out_of_band: boolean;
        payment_intent: string;
        payment_settings: PaymentSettings;
        period_end: number;
        period_start: number;
        post_payment_credit_notes_amount: number;
        pre_payment_credit_notes_amount: number;
        quote: string;
        receipt_number: string;
        rendering: string;
        shipping_cost: string;
        shipping_details: string;
        starting_balance: number;
        statement_descriptor: string;
        status: string;
        status_transitions: StatusTransitions;
        subscription: string;
        subscription_details: SubscriptionDetails;
        subtotal: number;
        subtotal_excluding_tax: number;
        tax: string;
        test_clock: string;
        total: number;
        total_discount_amounts: DiscountAmount[];
        total_excluding_tax: number;
        total_tax_amounts: any[];
        transfer_data: string;
        webhooks_delivered_at: string;
    }
}

export interface AutomaticTax {
    enabled: boolean;
    liability: string;
    status: string;
}

export interface Discount {
    id: string;
    object: string;
    checkout_session: string;
    coupon: Coupon;
    customer: string;
    end: string;
    invoice: string;
    invoice_item: string;
    promotion_code: string;
    start: number;
    subscription: string;
    subscription_item: string;
}

export interface Coupon {
    id: string;
    object: string;
    amount_off: string;
    created: number;
    currency: string;
    duration: string;
    duration_in_months: string;
    livemode: boolean;
    max_redemptions: string;
    metadata: any;
    name: string;
    percent_off: number;
    redeem_by: string;
    times_redeemed: number;
    valid: boolean;
}

export interface Issuer {
    type: string;
}

export interface Lines {
    object: string;
    data: Datum[];
    has_more: boolean;
    total_count: number;
    url: string;
}

export interface Datum {
    id: string;
    object: string;
    amount: number;
    amount_excluding_tax: number;
    currency: string;
    description: string;
    discount_amounts: DiscountAmount[];
    discountable: boolean;
    discounts: any[];
    invoice: string;
    livemode: boolean;
    metadata: any;
    period: Period;
    plan: Plan;
    price: Price;
    proration: boolean;
    proration_details: ProrationDetails;
    quantity: number;
    subscription: string;
    subscription_item: string;
    tax_amounts: any[];
    tax_rates: any[];
    type: string;
    unit_amount_excluding_tax: null | string;
}

export interface DiscountAmount {
    amount: number;
    discount: string;
}

export interface Period {
    end: number;
    start: number;
}

export interface Plan {
    id: string;
    object: string;
    active: boolean;
    aggregate_usage: string;
    amount: string;
    amount_decimal: number;
    billing_scheme: string;
    created: number;
    currency: string;
    interval: string;
    interval_count: number;
    livemode: boolean;
    metadata: any;
    meter: string;
    nickname: string;
    product: string;
    tiers_mode: string;
    transform_usage: string;
    trial_period_days: string;
    usage_type: string;
}

export interface Price {
    id: string;
    object: string;
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: string;
    livemode: boolean;
    lookup_key: string;
    metadata: any;
    nickname: string;
    product: string;
    recurring: Recurring;
    tax_behavior: string;
    tiers_mode: string;
    transform_quantity: number;
    type: string;
    unit_amount: string;
    unit_amount_decimal: number;
}

export interface Recurring {
    aggregate_usage: string;
    interval: string;
    interval_count: number;
    meter: string;
    trial_period_days: any;
    usage_type: string;
}

export interface ProrationDetails {
    credited_items: any;
}

export interface PaymentSettings {
    default_mandate: string;
    payment_method_options: string;
    payment_method_types: any;
}

export interface StatusTransitions {
    finalized_at: string;
    marked_uncollectible_at: string;
    paid_at: string;
    voided_at: string;
}

export interface SubscriptionDetails {
    metadata: any;
}

export interface Request {
    id: string;
    idempotency_key: string;
}
