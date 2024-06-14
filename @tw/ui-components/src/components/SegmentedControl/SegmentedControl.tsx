import { PropsWithChildren, forwardRef } from 'react';
import {
  SegmentedControl as MantineSegmentedControl,
  SegmentedControlProps as MantineSegmentedControlProps,
} from '@mantine/core';
import { TwBaseProps, FormattedColor, MantinePropsToRemove, TwStyleSystemProps } from '../../types';
// import { activeControl } from './SegmentedControl.css';

export interface SegmentedControlProps
  extends TwBaseProps,
    PropsWithChildren,
    TwStyleSystemProps,
    Omit<MantineSegmentedControlProps, MantinePropsToRemove> {
  color?: FormattedColor;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>((props, ref) => {
  return <MantineSegmentedControl {...props} styles={(theme) => ({
    root: {
      backgroundColor: 'transparent',
    },
    indicator: {
      backgroundColor: theme.colors.gray[2]
    }
  })} ref={ref} />;
});
