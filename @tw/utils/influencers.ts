export const createUtmCampaign = (influencer) => {
  return influencer.campaign ? `${influencer.name}-${influencer.campaign}` : influencer.name;
};
