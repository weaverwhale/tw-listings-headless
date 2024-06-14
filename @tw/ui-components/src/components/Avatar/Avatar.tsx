import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps, FormattedColor } from '../../types';
import {
  Avatar as MantineAvatar,
  AvatarProps as MantineAvatarProps,
  GetStylesApiOptions,
} from '@mantine/core';

export interface AvatarProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<MantineAvatarProps, keyof GetStylesApiOptions> {
  color?: FormattedColor;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  return <MantineAvatar {...props} ref={ref} />;
});
