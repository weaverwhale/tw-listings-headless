import { PropsWithChildren, forwardRef } from 'react';
import {
  RingProgress as MantineRingProgress,
  GetStylesApiOptions,
  MantineStyleProps,
} from '@mantine/core';
import { TwBaseProps, FormattedColor } from '../../types';
import { PropsFrom } from '../../utility-types';

import { getMarketingProps } from '../../utils/commonPropGenerators';

export interface RingProgressProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<
      PropsFrom<typeof MantineRingProgress>,
      keyof GetStylesApiOptions | keyof MantineStyleProps
    > {
  rootColor?: FormattedColor;
}

export const RingProgress = forwardRef<HTMLDivElement, RingProgressProps>((props, ref) => {
  return (
    <MantineRingProgress
      {...props}
      ref={ref}
      data-tw-ui-component="RingProgress"
      {...getMarketingProps('ring-progress')}
    />
  );
});
