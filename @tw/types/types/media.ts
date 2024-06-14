export type MediaSource = 'media_library' | 'affluencer' | 'creative' | 'inventory' | 'products';

export type MediaType = {
  _id?: any;
  id?: string;
  shop_id: string;
  name: string;
  service_id: string;
  source: string;
  file_size?: string;
  media_type: string;
  gcs_path: string;
  url?: string;
  custom_id?: string;
  tags?: string;
  thumbnail?: string;
  versions?: MediaItemType[];
  version_base?: string;
};

export type MediaItemType = {
  _id?: any;
  id?: string;
  shop_id: string;
  name: string;
  service_id: string;
  source: string;
  file_size?: string;
  media_type: string;
  gcs_path: string;
  url?: string;
  custom_id?: string;
  tags?: string;
  thumbnail?: string;
  versions?: MediaItemType[];
  version_base?: string;
};
