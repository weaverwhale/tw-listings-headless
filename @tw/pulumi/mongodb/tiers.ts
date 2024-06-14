export type AtlasTier =
  | 'M10'
  | 'M20'
  | 'M30'
  | 'M40'
  | 'M50'
  | 'M60'
  | 'M80'
  | 'M140'
  | 'M200'
  | 'M250'
  | 'M300'
  | 'M400'
  | 'M600';

export const atlasTiers: AtlasTier[] = [
  'M10',
  'M20',
  'M30',
  'M40',
  'M50',
  'M60',
  'M80',
  'M140',
  'M200',
  'M250',
  'M300',
  'M400',
  'M600',
];

export function getRelativeTier(tier: AtlasTier, jump) {
  const ind = atlasTiers.indexOf(tier);
  return atlasTiers[ind + jump];
}
