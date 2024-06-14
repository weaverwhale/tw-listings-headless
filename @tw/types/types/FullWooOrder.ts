export interface FullWooOrder {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: string;
    date_modified: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    customer_id: number;
    order_key: string;
    billing: WooBilling;
    shipping: WooBilling;
    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    customer_ip_address: string;
    customer_user_agent: string;
    created_via: string;
    customer_note: string;
    date_completed?: string;
    date_paid?: string;
    cart_hash: string;
    number: string;
    meta_data: {
        id: string; key: string;
        value: string |
            {
                pys_landing: string;
                pys_source: string;
                pys_utm: string;
                pys_browser_time: string;
                last_pys_landing: string;
                last_pys_source: string;
                last_pys_utm: string;
                pys_utm_id: string;
                last_pys_utm_id: string;
            } |
            {
                orders_count: number;
                avg_order_value: number;
                ltv: number
            }
    }[];
    line_items: WooLineItem[];
    tax_lines: {
        id: number;
        rate_code: string;
        rate_id: number;
        label: string;
        compound: boolean;
        tax_total: string;
        shipping_tax_total: string;
        rate_percent: string;
        meta_data: any[]
    }[];
    shipping_lines: WooShippingLine[];
    fee_lines: any[];
    coupon_lines: any[];
    refunds: any[];
    payment_url: string;
    is_editable: boolean;
    needs_payment: boolean;
    needs_processing: boolean;
    date_created_gmt: string;
    date_modified_gmt: string;
    date_completed_gmt: string;
    date_paid_gmt: string;
    currency_symbol: string;
    _links: {
        self: {
            href: string
        }[];
        collection: {
            href: string
        }[]
    };
}

export interface WooBilling {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
}

export interface WooShipping {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
}

export interface WooShippingLine {
    id: number;
    method_title: string;
    method_id: string;
    instance_id: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: {
        id: number;
        key: string;
        value: string;
        display_key: string;
        display_value: string
    }[]
}

export interface WooLineItem {
    id: string;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: string;
    meta_data: {
        id: string;
        key: string;
        value: string;
        display_key: string;
        display_value: string
    }[];
    sku: string;
    price: number;
    img: {
        id: number;
        src: string
    };
    parent_name: string;
}
