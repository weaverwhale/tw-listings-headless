export interface OptionDescriptor {
  value: string;
  label: any;// Its actually react node
}

export const AOV_SEGMENTS: OptionDescriptor[] = [
  {
    value: '$100+',
    label: '$100+',
  },
  {
    value: '>$100',
    label: '>$100',
  },
];

export const TOTAL_SPEND_SEGMENTS: OptionDescriptor[] = [
  {
    value: '<50K',
    label: '<50K',
  },
  {
    value: '>50K+',
    label: '>50K+',
  },
];

export const TW_BENCHMARKS_AOV_SEGMENT = 'TW_BENCHMARKS_AOV_SEGMENT';
export const TW_BENCHMARKS_SPEND_SEGMENT = 'TW_BENCHMARKS_SPEND_SEGMENT';
