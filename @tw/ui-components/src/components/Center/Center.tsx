import { FC } from 'react';
import { MantinePropsToRemove, TwBaseProps, TwStyleSystemProps } from '../../types';
import { Center as MantineCenter, CenterProps as MantineCenterProps } from '@mantine/core';

export interface CenterProps
  extends TwBaseProps,
    TwStyleSystemProps,
    Omit<MantineCenterProps, MantinePropsToRemove> {}

// TODO: See what to do about forwarding refs here
export const Center: FC<CenterProps> = (props) => {
  return <MantineCenter {...props} />;
};
