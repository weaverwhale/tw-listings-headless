import { Base } from './base';

export declare type Product = {
  id: number;
  shop_id: number;
  body_html: string;
  title: string;
  handle: string;
  product_type: string;
  created_at: Date;
  updated_at: Date;
  published_at: Date;
  published_scope: string;
  status: string;
  template_suffix: string;
  // tags: string;
  vendor: string;
} & Base;

export declare type Image = {
  id: number;
  shop_id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  src: string;
} & Base;

export declare type Options = {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
};

export declare type Variant = {
  id: number;
  title: string;
  price: number;
  product_id: number;
  sku: string;
  requires_shipping: boolean;
  barcode: string;
  compare_at_price: any;
  created_at: string;
  fulfillment_service: string;
  grams: number;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_management: string;
  inventory_policy: string;
  inventory_quantity: number;
  // option1: string;
  position: number;
  taxable: boolean;
  updated_at: string;
} & Base;
