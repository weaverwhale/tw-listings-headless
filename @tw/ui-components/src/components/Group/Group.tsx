import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps } from '../../types';
import { Group as MantineGroup, GroupProps as MantineGroupProps } from '@mantine/core';

// TODO: Limit props
export interface GroupProps extends TwBaseProps, PropsWithChildren, MantineGroupProps {}

export const Group = forwardRef<HTMLDivElement, GroupProps>((props, ref) => {
  return <MantineGroup {...props} ref={ref} />;
});
