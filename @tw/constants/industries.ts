
export const IndustryTypeArr = [
  'health_beauty',
  'clothing',
  'home_garden',
  'food_beverages',
  'fashion_accessories',
  'sporting_goods',
  'pet_supplies',
  'electronics',
  'baby',
  'other',
  'art',
  'all',
  'books',
  'toys_hobbies',
  'automotive',
  'car_truck_parts',
  'jewelry_watches',
  'shoes',
  'crafts',
  'computers',
  'collectibles',
  'office_products',
  'digital_products',
  'hair_braids',
] as const;

export type IndustryTypes = (typeof IndustryTypeArr)[number];

export type IndustryElement<I extends IndustryTypes> = {
  id: I;
  label: string;
  color: string;
};

export type IndustryDictionary = {
  [industry in IndustryTypes]: IndustryElement<industry>;
};

const INDUSTRIES: IndustryDictionary = {
  all: {
    id: 'all',
    label: 'All',
    color: '#FFC0CB',
  },
  art: {
    id: 'art',
    label: 'Art',
    color: '#FFC0CB',
  },
  baby: {
    id: 'baby',
    label: 'Baby',
    color: '#FFB6C1',
  },
  books: {
    id: 'books',
    label: 'Books',
    color: '#FF69B4',
  },
  shoes: {
    id: 'shoes',
    label: 'Shoes',
    color: '#FF1493',
  },
  crafts: {
    id: 'crafts',
    label: 'Crafts',
    color: '#DB7093',
  },
  clothing: {
    id: 'clothing',
    label: 'Clothing',
    color: '#C71585',
  },
  computers: {
    id: 'computers',
    label: 'Computers',
    color: '#FFA07A',
  },
  electronics: {
    id: 'electronics',
    label: 'Electronics',
    color: '#FA8072',
  },
  collectibles: {
    id: 'collectibles',
    label: 'Collectibles',
    color: '#E9967A',
  },
  pet_supplies: {
    id: 'pet_supplies',
    label: 'Pet Supplies',
    color: '#F08080',
  },
  home_garden: {
    id: 'home_garden',
    label: 'Home & Garden',
    color: '#CD5C5C',
  },
  sporting_goods: {
    id: 'sporting_goods',
    label: 'Sporting & Goods',
    color: '#DC143C',
  },
  toys_hobbies: {
    id: 'toys_hobbies',
    label: 'Toys & Hobbies',
    color: '#B22222',
  },
  health_beauty: {
    id: 'health_beauty',
    label: 'Health & Beauty',
    color: '#8B0000',
  },
  office_products: {
    id: 'office_products',
    label: 'Office Products',
    color: '#FF0000',
  },
  digital_products: {
    id: 'digital_products',
    label: 'Digital Products',
    color: '#FF4500',
  },
  food_beverages: {
    id: 'food_beverages',
    label: 'Food & Beverages',
    color: '#FF6347',
  },
  car_truck_parts: {
    id: 'car_truck_parts',
    label: 'Car & Truck Parts',
    color: '#FF7F50',
  },
  jewelry_watches: {
    id: 'jewelry_watches',
    label: 'Jewelry & Watches',
    color: '#FF8C00',
  },
  fashion_accessories: {
    id: 'fashion_accessories',
    label: 'Fashion Accessories',
    color: '#FFA500',
  },
  other: {
    id: 'other',
    label: 'Other',
    color: '#FF8C00',
  },
  automotive: {
    id: 'automotive',
    label: 'Automotive',
    color: '#FF4500',
  },
  hair_braids: {
    id: 'hair_braids',
    label: 'Hair & Braids',
    color: '#FF6347',
  },
};

export default INDUSTRIES;
