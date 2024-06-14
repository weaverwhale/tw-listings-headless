import { forwardRef } from 'react';
import { Progress as MantineProgress, ProgressProps as MantineProgressProps } from '@mantine/core';
import { FormattedColor, MantinePropsToRemove, TwBaseProps } from '../../types';

import { getMarketingProps } from '../../utils/commonPropGenerators';

export interface ProgressProps
  extends TwBaseProps,
    Omit<MantineProgressProps, MantinePropsToRemove> {
  color?: FormattedColor;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) => {
  return (
    <MantineProgress
      {...props}
      ref={ref}
      data-tw-ui-component="Progress"
      {...getMarketingProps('progress')}
    />
  );
});
