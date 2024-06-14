import { MediaItemType } from '@tw/types';

const storageUrl = 'https://storage.googleapis.com';

export function creativeHubMedia(media: MediaItemType, isStaging = false): MediaItemType {
  const bucketName = isStaging
    ? 'file-hosting-bucket-triple-whale-staging'
    : 'file-hosting-bucket-shofifi';
  if (!media.url) {
    let publicUrl = `${storageUrl}/${bucketName}/${media.source}`;
    switch (media.source) {
      case 'influencer-creatives':
        publicUrl += `/${media.media_type}s/${media.shop_id}/${media.custom_id}`;
        break;
      case 'products':
        if (media.service_id === 'shopify') {
          publicUrl += `/${media.shop_id}/${media.service_id}/${media.custom_id}`;
        } else {
          publicUrl += `/${media.shop_id}/${media.service_id}/${media.media_type}s`;
        }
        break;
      default:
        publicUrl += `/${media.shop_id}/${media.service_id}/${media.media_type}s`;
        //I dont think this is necessary
        // if (media.custom_id) {
        //   publicUrl += `${media.custom_id}/`;
        // }
        break;
    }
    publicUrl += media.gcs_path;
    media.url = publicUrl;
  }
  if (media.media_type === 'video' && media.thumbnail) {
    let regex = '/storage.googleapis.com/';
    if (!media.thumbnail.match(regex)) {
      let thumbnailUrl = `${storageUrl}/${bucketName}/${media.source}`;
      switch (media.source) {
        case 'influencer-creatives':
          thumbnailUrl += `/${media.media_type}s/${media.shop_id}/${media.custom_id}`;
          break;
        default:
          thumbnailUrl += `/${media.shop_id}/${media.service_id}/thumbnails`;
          break;
      }
      thumbnailUrl += media.thumbnail;
      media.thumbnail = thumbnailUrl;
    }
  }
  return { ...media };
}
