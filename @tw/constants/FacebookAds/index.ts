//ad placement names

export const FACEBOOK_FEED_PLACEMENT_NAME = 'facebook_feed';
export const FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME = 'facebook_right_hand_column';
export const FACEBOOK_MARKETPLACE_PLACEMENT_NAME = 'facebook_marketplace';
export const FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME = 'facebook_video_feeds';
export const FACEBOOK_STORY_PLACEMENT_NAME = 'facebook_story';
export const FACEBOOK_SEARCH_PLACEMENT_NAME = 'facebook_search';
export const FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME = 'facebook_instream_video';
export const FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME = 'facebook_facebook_reels';
export const INSTAGRAM_FEED_PLACEMENT_NAME = 'instagram_feed';
export const INSTAGRAM_STREAM_PLACEMENT_NAME = 'instagram_stream';
export const INSTAGRAM_EXPLORE_PLACEMENT_NAME = 'instagram_explore';
export const INSTAGRAM_EXPLORE_CONTEXTUAL_PLACEMENT_NAME = 'instagram_explore_contextual';
export const INSTAGRAM_PROFILE_PLACEMENT_NAME = 'instagram_profile';
export const INSTAGRAM_REELS_PLACEMENT_NAME = 'instagram_reels';
export const INSTAGRAM_SHOP_PLACEMENT_NAME = 'instagram_shop';
export const INSTAGRAM_STORY_PLACEMENT_NAME = 'instagram_story';
export const INSTAGRAM_EXPLORE_GRID_HOME_PLACEMENT_NAME = 'instagram_explore_grid_home';
export const INSTAGRAM_EXPLORE_IMMERSIVE_PLACEMENT_NAME = 'instagram_explore_immersive';
export const INSTAGRAM_PROFILE_FEED_PLACEMENT_NAME = 'instagram_profile_feed';
export const FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME = 'facebook_instant_articles';
export const MESSENGER_STORY_PLACEMENT_NAME = 'messenger_story';
export const AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME = 'audience_network_classic';
export const AUDIENCE_NETWORK_BANNER_PLACEMENT_NAME = 'audience_network_banner';
export const AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT_NAME = 'audience_network_rewarded_video';
export const MESSENGER_HOME_PLACEMENT_NAME = 'messenger_home';
export const SPONSORED_MESSAGES_PLACEMENT_NAME = 'sponsored_messages';

//ad placements
export const FACEBOOK_FEED_PLACEMENT = 'feed';
export const FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT = 'right_hand_column';
export const FACEBOOK_MARKETPLACE_PLACEMENT = 'marketplace';
export const FACEBOOK_VIDEO_FEEDS_PLACEMENT = 'video_feeds';
export const FACEBOOK_STORY_PLACEMENT = 'story';
export const FACEBOOK_SEARCH_PLACEMENT = 'search';
export const FACEBOOK_INSTREAM_VIDEO_PLACEMENT = 'instream_video';
export const FACEBOOK_FACEBOOK_REELS_PLACEMENT = 'facebook_reels';
export const INSTAGRAM_FEED_PLACEMENT = 'feed'; //don't know if this is correct
export const INSTAGRAM_STREAM_PLACEMENT = 'stream';
export const INSTAGRAM_STORY_PLACEMENT = 'story';
export const INSTAGRAM_SHOP_PLACEMENT = 'shop';
export const INSTAGRAM_EXPLORE_PLACEMENT = 'explore';
export const INSTAGRAM_EXPLORE_HOME_PLACEMENT = 'explore_home';
export const INSTAGRAM_REELS_PLACEMENT = 'reels';
export const INSTAGRAM_PROFILE_FEED_PLACEMENT = 'profile_feed';
export const AUDIENCE_NETWORK_CLASSIC_PLACEMENT = 'classic';
export const AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT = 'rewarded_video';
export const MESSENGER_HOME_PLACEMENT = 'messenger_home';
export const SPONSORED_MESSAGES_PLACEMENT = 'sponsored_messages';
export const MESSENGER_STORY_PLACEMENT = 'story';

//unmapped weird placements
export const FACEBOOK_INSTANT_ARTICLES_PLACEMENT = 'instant_articles';

export const placement_names_to_type = {
  [FACEBOOK_FEED_PLACEMENT_NAME]: FACEBOOK_FEED_PLACEMENT,
  [FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME]: FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT,
  [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: FACEBOOK_MARKETPLACE_PLACEMENT,
  [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: FACEBOOK_VIDEO_FEEDS_PLACEMENT,
  [FACEBOOK_STORY_PLACEMENT_NAME]: FACEBOOK_STORY_PLACEMENT,
  [FACEBOOK_SEARCH_PLACEMENT_NAME]: FACEBOOK_SEARCH_PLACEMENT,
  [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: FACEBOOK_INSTREAM_VIDEO_PLACEMENT,
  [FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME]: FACEBOOK_FACEBOOK_REELS_PLACEMENT,
  [INSTAGRAM_FEED_PLACEMENT_NAME]: INSTAGRAM_FEED_PLACEMENT,
  [INSTAGRAM_STREAM_PLACEMENT_NAME]: INSTAGRAM_STREAM_PLACEMENT,
  [INSTAGRAM_STORY_PLACEMENT_NAME]: INSTAGRAM_STORY_PLACEMENT,
  [INSTAGRAM_SHOP_PLACEMENT_NAME]: INSTAGRAM_SHOP_PLACEMENT,
  [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: INSTAGRAM_EXPLORE_PLACEMENT,
  [INSTAGRAM_EXPLORE_GRID_HOME_PLACEMENT_NAME]: INSTAGRAM_EXPLORE_HOME_PLACEMENT,
  [INSTAGRAM_REELS_PLACEMENT_NAME]: INSTAGRAM_REELS_PLACEMENT,
  [INSTAGRAM_PROFILE_FEED_PLACEMENT_NAME]: INSTAGRAM_PROFILE_FEED_PLACEMENT,
  [AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME]: AUDIENCE_NETWORK_CLASSIC_PLACEMENT,
  [AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT_NAME]: AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT,
  [MESSENGER_HOME_PLACEMENT_NAME]: MESSENGER_HOME_PLACEMENT,
  [SPONSORED_MESSAGES_PLACEMENT_NAME]: SPONSORED_MESSAGES_PLACEMENT,
  [MESSENGER_STORY_PLACEMENT_NAME]: MESSENGER_STORY_PLACEMENT,
  [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: FACEBOOK_INSTANT_ARTICLES_PLACEMENT,
};

//campaign objectives
export const BRAND_AWARENESS_OBJECTIVE = 'BRAND_AWARENESS';
export const REACH_OBJECTIVE = 'REACH';
export const TRAFFIC_OBJECTIVE = 'TRAFFIC';
export const ENGAGEMENT_OBJECTIVE = 'ENGAGEMENT';
export const PAGE_LIKES_OBJECTIVE = 'PAGE_LIKES';
export const EVENT_RESPONSES_OBJECTIVE = 'EVENT_RESPONSES';
export const APP_INSTALLS_OBJECTIVE = 'APP_INSTALLS';
export const VIDEO_VIEWS_OBJECTIVE = 'VIDEO_VIEWS';
export const LEAD_GENERATION_OBJECTIVE = 'LEAD_GENERATION';
export const MESSAGES_OBJECTIVE = 'MESSAGES';
export const CONVERSIONS_OBJECTIVE = 'CONVERSIONS';
export const CATALOG_SALES_OBJECTIVE = 'CATALOG_SALES';
export const STORE_VISITS_OBJECTIVE = 'STORE_VISITS';

export const PLACEMENT_SELECT_OPTIONS = [
  {
    label: 'Feeds',
    value: 'feeds',
    options: [
      { label: 'Facebook Feed', value: FACEBOOK_FEED_PLACEMENT_NAME },
      { label: 'Instagram Feed', value: INSTAGRAM_FEED_PLACEMENT_NAME },
      { label: 'Facebook Marketplace', value: FACEBOOK_MARKETPLACE_PLACEMENT_NAME },
      { label: 'Facebook Video Feeds', value: FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME },
      { label: 'Facebook Right Column', value: FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME },
      { label: 'Instagram Explore', value: INSTAGRAM_EXPLORE_PLACEMENT_NAME },
      { label: 'Instagram Explore Home', value: INSTAGRAM_EXPLORE_GRID_HOME_PLACEMENT_NAME },
      { label: 'Instagram Shop', value: INSTAGRAM_SHOP_PLACEMENT_NAME },
    ],
  },
  {
    label: 'Messenger',
    value: 'messenger',
    options: [
      { label: 'Messenger Home', value: MESSENGER_HOME_PLACEMENT_NAME },
      { label: 'Sponsored Messages', value: SPONSORED_MESSAGES_PLACEMENT_NAME },
    ],
  },
  {
    label: 'Stories',
    value: 'stories',
    options: [
      { label: 'Facebook Story', value: FACEBOOK_STORY_PLACEMENT_NAME },
      { label: 'Instagram Story', value: INSTAGRAM_STORY_PLACEMENT_NAME },
      { label: 'Messenger Story', value: MESSENGER_STORY_PLACEMENT_NAME },
      { label: 'Facebook Reels', value: FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME },
      { label: 'Instagram Reels', value: INSTAGRAM_REELS_PLACEMENT_NAME },
    ],
  },
  {
    label: 'In-stream ads for videos and reels',
    value: 'in-stream',
    options: [
      { label: 'Facebook In-stream Video', value: FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME },
      { label: 'Instagram In-stream Video', value: INSTAGRAM_STREAM_PLACEMENT_NAME },
    ],
  },
  {
    label: 'Search',
    value: 'search',
    options: [
      { label: 'Facebook Search', value: FACEBOOK_SEARCH_PLACEMENT_NAME },
      { label: 'Instagram Search', value: INSTAGRAM_PROFILE_FEED_PLACEMENT_NAME },
    ],
  },
  {
    label: 'In articles',
    value: 'instant-articles',
    options: [
      { label: 'Facebook Instant Articles', value: FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME },
    ],
  },
  {
    label: 'Audience Network',
    value: 'audience-network',
    options: [
      { label: 'Audience Network Classic', value: AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME },
      {
        label: 'Audience Network Rewarded Video',
        value: AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT_NAME,
      },
    ],
  },
];

export const OBJECTIVES = [
  BRAND_AWARENESS_OBJECTIVE,
  REACH_OBJECTIVE,
  TRAFFIC_OBJECTIVE,
  ENGAGEMENT_OBJECTIVE,
  PAGE_LIKES_OBJECTIVE,
  EVENT_RESPONSES_OBJECTIVE,
  APP_INSTALLS_OBJECTIVE,
  VIDEO_VIEWS_OBJECTIVE,
  LEAD_GENERATION_OBJECTIVE,
  MESSAGES_OBJECTIVE,
  CONVERSIONS_OBJECTIVE,
  CATALOG_SALES_OBJECTIVE,
  STORE_VISITS_OBJECTIVE,
];

export const OLD_PLACEMENT_MAPPINGS = {
  OUTCOME_APP_PROMOTION: APP_INSTALLS_OBJECTIVE,
  OUTCOME_AWARENESS: BRAND_AWARENESS_OBJECTIVE,
  OUTCOME_ENGAGEMENT: ENGAGEMENT_OBJECTIVE,
  OUTCOME_LEADS: LEAD_GENERATION_OBJECTIVE,
  OUTCOME_SALES: CATALOG_SALES_OBJECTIVE,
  OUTCOME_TRAFFIC: TRAFFIC_OBJECTIVE,
};

export const DEVICE_PLATFORMS = ['desktop', 'mobile'];

export const PUBLISHER_PLATFORMS = ['facebook', 'instagram', 'messenger', 'audience_network'];

export const FACEBOOK_PLACEMENTS = [
  FACEBOOK_FEED_PLACEMENT,
  FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT,
  FACEBOOK_MARKETPLACE_PLACEMENT,
  FACEBOOK_VIDEO_FEEDS_PLACEMENT,
  FACEBOOK_STORY_PLACEMENT,
  FACEBOOK_SEARCH_PLACEMENT,
  FACEBOOK_INSTREAM_VIDEO_PLACEMENT,
  FACEBOOK_FACEBOOK_REELS_PLACEMENT,
];

export const INSTAGRAM_PLACEMENTS = [
  INSTAGRAM_FEED_PLACEMENT,
  INSTAGRAM_STREAM_PLACEMENT,
  INSTAGRAM_STORY_PLACEMENT,
  INSTAGRAM_SHOP_PLACEMENT,
  INSTAGRAM_EXPLORE_PLACEMENT,
  INSTAGRAM_EXPLORE_HOME_PLACEMENT,
  INSTAGRAM_REELS_PLACEMENT,
  INSTAGRAM_PROFILE_FEED_PLACEMENT,
];

export const AUDIENCE_NETWORK_PLACEMENTS = [
  AUDIENCE_NETWORK_CLASSIC_PLACEMENT,
  AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT,
];

export const MESSENGER_PLACEMENTS = [
  MESSENGER_HOME_PLACEMENT,
  SPONSORED_MESSAGES_PLACEMENT,
  MESSENGER_STORY_PLACEMENT,
];

export const CUSTOM_WEIRD_PLACEMENTS = [FACEBOOK_INSTANT_ARTICLES_PLACEMENT];

//previews
export const FACEBOOK_FEED_MOBILE_PREVIEW = {
  value: 'MOBILE_FEED_STANDARD',
  label: 'Facebook Feed Mobile',
  width: '320',
  height: '500',
};
export const FACEBOOK_FEED_DESKTOP_PREVIEW = {
  value: 'DESKTOP_FEED_STANDARD',
  label: 'Facebook Feed Desktop',
};
export const FACEBOOK_RIGHT_HAND_COLUMN_MOBILE_PREVIEW = {
  value: 'RIGHT_COLUMN_STANDARD',
  label: 'Facebook Right Hand Column',
  width: '560',
  height: '210',
};
export const FACEBOOK_RIGHT_HAND_COLUMN_DESKTOP_PREVIEW = {
  value: 'RIGHT_COLUMN_STANDARD',
  label: 'Facebook Right Hand Column',
  width: '560',
  height: '210',
};
export const FACEBOOK_MARKETPLACE_MOBILE_PREVIEW = {
  value: 'MARKETPLACE_MOBILE',
  label: 'Facebook Marketplace Mobile',
};
export const FACEBOOK_MARKETPLACE_DESKTOP_PREVIEW = {
  value: 'MARKETPLACE_DESKTOP',
  label: 'Facebook Marketplace Desktop',
};
export const FACEBOOK_VIDEO_FEEDS_MOBILE_PREVIEW = {
  value: 'WATCH_FEED_MOBILE',
  label: 'Video Feeds Mobile',
}; //not sure
export const FACEBOOK_VIDEO_FEEDS_DESKTOP_PREVIEW = {
  value: 'WATCH_FEED_HOME',
  label: 'Video Feeds Desktop',
}; //not sure
export const FACEBOOK_STORY_MOBILE_PREVIEW = {
  value: 'FACEBOOK_STORY_MOBILE',
  label: 'Facebook Story Mobile',
};
export const FACEBOOK_STORY_DESKTOP_PREVIEW = '';
export const FACEBOOK_SEARCH_MOBILE_PREVIEW = '';
export const FACEBOOK_SEARCH_DESKTOP_PREVIEW = '';
export const FACEBOOK_INSTREAM_VIDEO_MOBILE_PREVIEW = {
  value: 'INSTREAM_VIDEO_MOBILE',
  label: 'Facebook Instream Video Mobile',
};
export const FACEBOOK_INSTREAM_VIDEO_DESKTOP_PREVIEW = {
  value: 'INSTREAM_VIDEO_DESKTOP',
  label: 'Facebook Instream Video Desktop',
};
export const FACEBOOK_FACEBOOK_REELS_MOBILE_PREVIEW = {
  value: 'FACEBOOK_REELS_MOBILE',
  label: 'Facebook Reels Mobile',
};
export const FACEBOOK_FACEBOOK_REELS_DESKTOP_PREVIEW = {
  value: 'FACEBOOK_REELS_DESKTOP',
  label: 'Facebook Reels Desktop',
};

export const FACEBOOK_INSTANT_ARTICLES_PLACEMENT_MOBILE_PREVIEW = {
  value: 'INSTANT_ARTICLE_STANDARD',
  label: 'Facebook Instant Articles Mobile',
};
export const FACEBOOK_INSTANT_ARTICLES_PLACEMENT_DESKTOP_PREVIEW = {
  value: 'INSTANT_ARTICLE_STANDARD',
  label: 'Facebook Instant Articles Desktop',
};

export const INSTAGRAM_FEED_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_STANDARD',
  label: 'Instagram Feed Mobile',
};
export const INSTAGRAM_FEED_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_FEED_WEB',
  label: 'Instagram Feed Desktop',
};
export const INSTAGRAM_STREAM_MOBILE_PREVIEW = '';
export const INSTAGRAM_STREAM_DESKTOP_PREVIEW = '';
export const INSTAGRAM_STORY_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_STORY',
  label: 'Instagram Story Mobile',
};
export const INSTAGRAM_STORY_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_STORY',
  label: 'Instagram Story Desktop',
};
export const INSTAGRAM_SHOP_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_SHOP',
  label: 'Instagram Shop Mobile',
};
export const INSTAGRAM_SHOP_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_SHOP',
  label: 'Instagram Shop Desktop',
};
export const INSTAGRAM_EXPLORE_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_EXPLORE_CONTEXTUAL',
  label: 'Instagram Explore Mobile',
};
export const INSTAGRAM_EXPLORE_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_EXPLORE_CONTEXTUAL',
  label: 'Instagram Explore Desktop',
};
export const INSTAGRAM_EXPLORE_HOME_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_EXPLORE_GRID_HOME',
  label: 'Instagram Explore Home Mobile',
};
export const INSTAGRAM_EXPLORE_HOME_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_EXPLORE_GRID_HOME',
  label: 'Instagram Explore Home Desktop',
};
export const INSTAGRAM_REELS_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_REELS',
  label: 'Instagram Reels Mobile',
};
export const INSTAGRAM_REELS_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_REELS',
  label: 'Instagram Reels Desktop',
};
export const INSTAGRAM_PROFILE_FEED_MOBILE_PREVIEW = {
  value: 'INSTAGRAM_PROFILE_FEED',
  label: 'Instagram Profile Feed Mobile',
};
export const INSTAGRAM_PROFILE_FEED_DESKTOP_PREVIEW = {
  value: 'INSTAGRAM_PROFILE_FEED',
  label: 'Instagram Profile Feed Desktop',
};

export const AUDIENCE_NETWORK_CLASSIC_MOBILE_PREVIEW = {
  value: 'AUDIENCE_NETWORK_INSTREAM_VIDEO',
  label: 'Audience Network Classic Mobile',
};
export const AUDIENCE_NETWORK_CLASSIC_DESKTOP_PREVIEW = {
  value: 'AUDIENCE_NETWORK_INSTREAM_VIDEO',
  label: 'Audience Network Classic Desktop',
};
export const AUDIENCE_NETWORK_REWARDED_VIDEO_MOBILE_PREVIEW = {
  value: 'AUDIENCE_NETWORK_REWARDED_VIDEO',
  label: 'Audience Network Rewarded Video Mobile',
};
export const AUDIENCE_NETWORK_REWARDED_VIDEO_DESKTOP_PREVIEW = {
  value: 'AUDIENCE_NETWORK_REWARDED_VIDEO',
  label: 'Audience Network Rewarded Video Desktop',
};

export const MESSENGER_HOME_MOBILE_PREVIEW = '';
export const MESSENGER_HOME_DESKTOP_PREVIEW = '';
export const SPONSORED_MESSAGES_MOBILE_PREVIEW = {
  value: 'MESSENGER_MOBILE_INBOX_MEDIA',
  label: 'Sponsored Messages Mobile',
};
export const SPONSORED_MESSAGES_DESKTOP_PREVIEW = {
  value: 'MESSENGER_MOBILE_INBOX_MEDIA',
  label: 'Sponsored Messages Desktop',
};
export const MESSENGER_STORY_MOBILE_PREVIEW = {
  value: 'MESSENGER_MOBILE_STORY_MEDIA',
  label: 'Messenger Story Mobile',
};
export const MESSENGER_STORY_DESKTOP_PREVIEW = {
  value: 'MESSENGER_MOBILE_STORY_MEDIA',
  label: 'Messenger Story Desktop',
};

export const PLACEMENT_TO_PREVIEW_MAPPING = {
  FACEBOOK_FEED_PLACEMENT: {
    mobile: FACEBOOK_FEED_MOBILE_PREVIEW,
    desktop: FACEBOOK_FEED_DESKTOP_PREVIEW,
  },
  FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT: {
    mobile: FACEBOOK_RIGHT_HAND_COLUMN_MOBILE_PREVIEW,
    desktop: FACEBOOK_RIGHT_HAND_COLUMN_DESKTOP_PREVIEW,
  },
  FACEBOOK_MARKETPLACE_PLACEMENT: {
    mobile: FACEBOOK_MARKETPLACE_MOBILE_PREVIEW,
    desktop: FACEBOOK_MARKETPLACE_DESKTOP_PREVIEW,
  },
  FACEBOOK_VIDEO_FEEDS_PLACEMENT: {
    mobile: FACEBOOK_VIDEO_FEEDS_MOBILE_PREVIEW,
    desktop: FACEBOOK_VIDEO_FEEDS_DESKTOP_PREVIEW,
  },
  FACEBOOK_STORY_PLACEMENT: {
    mobile: FACEBOOK_STORY_MOBILE_PREVIEW,
    desktop: FACEBOOK_STORY_DESKTOP_PREVIEW,
  },
  FACEBOOK_SEARCH_PLACEMENT: {
    mobile: FACEBOOK_SEARCH_MOBILE_PREVIEW,
    desktop: FACEBOOK_SEARCH_DESKTOP_PREVIEW,
  },
  FACEBOOK_INSTREAM_VIDEO_PLACEMENT: {
    mobile: FACEBOOK_INSTREAM_VIDEO_MOBILE_PREVIEW,
    desktop: FACEBOOK_INSTREAM_VIDEO_DESKTOP_PREVIEW,
  },
  INSTAGRAM_FEED_PLACEMENT: {
    mobile: INSTAGRAM_FEED_MOBILE_PREVIEW,
    desktop: INSTAGRAM_FEED_DESKTOP_PREVIEW,
  },
  INSTAGRAM_STREAM_PLACEMENT: {
    mobile: INSTAGRAM_STREAM_MOBILE_PREVIEW,
    desktop: INSTAGRAM_STREAM_DESKTOP_PREVIEW,
  },
  INSTAGRAM_STORY_PLACEMENT: {
    mobile: INSTAGRAM_STORY_MOBILE_PREVIEW,
    desktop: INSTAGRAM_STORY_DESKTOP_PREVIEW,
  },
  INSTAGRAM_SHOP_PLACEMENT: {
    mobile: INSTAGRAM_SHOP_MOBILE_PREVIEW,
    desktop: INSTAGRAM_SHOP_DESKTOP_PREVIEW,
  },
  INSTAGRAM_EXPLORE_PLACEMENT: {
    mobile: INSTAGRAM_EXPLORE_MOBILE_PREVIEW,
    desktop: INSTAGRAM_EXPLORE_DESKTOP_PREVIEW,
  },
  INSTAGRAM_EXPLORE_HOME_PLACEMENT: {
    mobile: INSTAGRAM_EXPLORE_HOME_MOBILE_PREVIEW,
    desktop: INSTAGRAM_EXPLORE_HOME_DESKTOP_PREVIEW,
  },
  INSTAGRAM_REELS_PLACEMENT: {
    mobile: INSTAGRAM_REELS_MOBILE_PREVIEW,
    desktop: INSTAGRAM_REELS_DESKTOP_PREVIEW,
  },
  INSTAGRAM_PROFILE_FEED_PLACEMENT: {
    mobile: INSTAGRAM_PROFILE_FEED_MOBILE_PREVIEW,
    desktop: INSTAGRAM_PROFILE_FEED_DESKTOP_PREVIEW,
  },
  AUDIENCE_NETWORK_CLASSIC_PLACEMENT: {
    mobile: AUDIENCE_NETWORK_CLASSIC_MOBILE_PREVIEW,
    desktop: AUDIENCE_NETWORK_CLASSIC_DESKTOP_PREVIEW,
  },
  AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT: {
    mobile: AUDIENCE_NETWORK_REWARDED_VIDEO_MOBILE_PREVIEW,
    desktop: AUDIENCE_NETWORK_REWARDED_VIDEO_DESKTOP_PREVIEW,
  },
  MESSENGER_HOME_PLACEMENT: {
    mobile: MESSENGER_HOME_MOBILE_PREVIEW,
    desktop: MESSENGER_HOME_DESKTOP_PREVIEW,
  },
  SPONSORED_MESSAGES_PLACEMENT: {
    mobile: SPONSORED_MESSAGES_MOBILE_PREVIEW,
    desktop: SPONSORED_MESSAGES_DESKTOP_PREVIEW,
  },
  MESSENGER_STORY_PLACEMENT: {
    mobile: MESSENGER_STORY_MOBILE_PREVIEW,
    desktop: MESSENGER_STORY_DESKTOP_PREVIEW,
  },
};

type placementAdTypes = 'image' | 'video' | 'carousal' | 'collection';
type PlacementType = placementAdTypes[];
type PlacementRequirementTypes = {
  [key: string]: PlacementType;
};
type AllowedPlacementTypes = {
  [key: string]: PlacementRequirementTypes;
};

export const ALLOWED_PLACEMENTS_BY_OBJECTIVE: AllowedPlacementTypes = {
  [BRAND_AWARENESS_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [MESSENGER_STORY_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_REELS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_STREAM_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
  [REACH_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    // [AD_PLACEMENTS.FACEBOOK_GROUPS_FEED]: ['image'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [MESSENGER_STORY_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_REELS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_STREAM_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
  [TRAFFIC_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME]: ['image', 'carousal'],
    [INSTAGRAM_SHOP_PLACEMENT_NAME]: ['image'],
    // [SPONSORED_MESSAGES_PLACEMENT_NAME]: ['image', 'carousal'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [MESSENGER_STORY_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_REELS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['video', 'carousal', 'collection'],
    [FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
  [ENGAGEMENT_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: ['image', 'video'],
  },
  [PAGE_LIKES_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video'],
  },
  [EVENT_RESPONSES_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['image'],
  },
  [APP_INSTALLS_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [MESSENGER_STORY_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_REELS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
  [VIDEO_VIEWS_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [MESSENGER_STORY_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_REELS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
  [LEAD_GENERATION_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
  [MESSAGES_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    // [SPONSORED_MESSAGES_PLACEMENT_NAME]: ['image', 'carousal'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['carousal'],
    // [MESSENGER_STORY_PLACEMENT_NAME]: ['image'],
  },
  [CONVERSIONS_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME]: ['image', 'carousal'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_SHOP_PLACEMENT_NAME]: ['image'],
    // [SPONSORED_MESSAGES_PLACEMENT_NAME]: ['image', 'carousal'],
    // [AD_PLACEMENTS.FACEBOOK_GROUPS_FEED]: ['image'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [MESSENGER_STORY_PLACEMENT_NAME]: ['image', 'video'],
    [INSTAGRAM_REELS_PLACEMENT_NAME]: ['video'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_INSTANT_ARTICLES_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [AUDIENCE_NETWORK_REWARDED_VIDEO_PLACEMENT_NAME]: ['video'],
  },
  [CATALOG_SALES_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'collection'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME]: ['image', 'carousal'],
    [INSTAGRAM_EXPLORE_PLACEMENT_NAME]: ['image'],
    [INSTAGRAM_SHOP_PLACEMENT_NAME]: ['image'],
    [SPONSORED_MESSAGES_PLACEMENT_NAME]: ['image', 'carousal'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['carousal'],
    [FACEBOOK_INSTREAM_VIDEO_PLACEMENT_NAME]: ['carousal', 'collection'],
    [FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME]: ['image', 'video'],
    [FACEBOOK_SEARCH_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    // [AUDIENCE_NETWORK_CLASSIC_PLACEMENT_NAME]: ['image', 'carousal'],
  },
  [STORE_VISITS_OBJECTIVE]: {
    [FACEBOOK_FEED_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [INSTAGRAM_FEED_PLACEMENT_NAME]: ['image', 'video', 'collection', 'carousal'],
    [FACEBOOK_MARKETPLACE_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
    [INSTAGRAM_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal', 'collection'],
    [FACEBOOK_STORY_PLACEMENT_NAME]: ['image', 'video', 'carousal'],
  },
};

export const FACEBOOK_AD_FORMATS: any = [
  // { label: 'Mobile Banner', value: 'MOBILE_BANNER', width:"320", height:"138" },
  {
    label: 'Feed Basic',
    value: 'MOBILE_FEED_BASIC',
    width: '320',
    height: '580',
    placement_name: FACEBOOK_FEED_PLACEMENT_NAME,
  },
  // { label: 'Suggested Video Mobile', value: 'SUGGESTED_VIDEO_MOBILE',width:"320" , height:"500"},
  {
    label: 'Watch Feed',
    value: 'WATCH_FEED_MOBILE',
    width: '320',
    height: '500',
    placement_name: FACEBOOK_VIDEO_FEEDS_PLACEMENT_NAME,
  },
  {
    label: 'Facebook Story',
    value: 'FACEBOOK_STORY_MOBILE',
    width: '320',
    height: '500',
    placement_name: FACEBOOK_STORY_PLACEMENT_NAME,
  },
  {
    label: 'Facebook Reels',
    value: 'FACEBOOK_REELS_MOBILE',
    width: '320',
    height: '560',
    placement_name: FACEBOOK_FACEBOOK_REELS_PLACEMENT_NAME,
  },
  {
    label: 'Right Column Standard',
    value: 'RIGHT_COLUMN_STANDARD',
    width: '560',
    height: '210',
    placement_name: FACEBOOK_RIGHT_HAND_COLUMN_PLACEMENT_NAME,
  },
];

export const INSTAGRAM_AD_FORMATS = [
  {
    label: 'Instagram Standard',
    value: 'INSTAGRAM_STANDARD',
    width: '318',
    placement_name: INSTAGRAM_FEED_PLACEMENT_NAME,
  },
  {
    label: 'Instagram Story',
    value: 'INSTAGRAM_STORY',
    width: '318',
    placement_name: INSTAGRAM_STORY_PLACEMENT_NAME,
  },
  // { label: 'Instagram Story Mobile', value: 'INSTAGRAM_STORY_WEB_M_SITE' },
  // { label: 'Instagram Feed Web', value: 'INSTAGRAM_FEED_WEB' },
  // { label: 'Instagram Feed Mobile', value: 'INSTAGRAM_FEED_WEB_M_SITE' },
  // { label: 'Instagram Story Web', value: 'INSTAGRAM_STORY_WEB' },
  {
    label: 'Instagram Explore Grid Home',
    value: 'INSTAGRAM_EXPLORE_GRID_HOME',
    width: '318',
    placement_name: INSTAGRAM_EXPLORE_GRID_HOME_PLACEMENT_NAME,
  },
  {
    label: 'Instagram Explore Contextual',
    value: 'INSTAGRAM_EXPLORE_CONTEXTUAL',
    width: '318',
    placement_name: INSTAGRAM_EXPLORE_PLACEMENT_NAME,
  },
  // { label: 'Instagram Explore Immersive', value: 'INSTAGRAM_EXPLORE_IMMERSIVE',width:"318"  },
  {
    label: 'Instagram Profile Feed',
    value: 'INSTAGRAM_PROFILE_FEED',
    width: '318',
    placement_name: INSTAGRAM_PROFILE_FEED_PLACEMENT_NAME,
  },
  {
    label: 'Instagram Reels',
    value: 'INSTAGRAM_REELS',
    width: '318',
    placement_name: INSTAGRAM_REELS_PLACEMENT_NAME,
  },
  // { label: 'Instagram Reels Overlay', value: 'INSTAGRAM_REELS_OVERLAY' },
  // { label: 'Instagram Search Chain', value: 'INSTAGRAM_SEARCH_CHAIN' },
  // { label: 'Instagram Search Grid', value: 'INSTAGRAM_SEARCH_GRID' },
  {
    label: 'Instagram Shop',
    value: 'INSTAGRAM_SHOP',
    width: '318',
    placement_name: INSTAGRAM_SHOP_PLACEMENT_NAME,
  },
];
