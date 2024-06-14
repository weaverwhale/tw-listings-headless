import { forwardRef } from 'react';
import { TwBaseProps, FormattedColor } from '../../types';
import {
  GetStylesApiOptions,
  Badge as MantineBadge,
  BadgeProps as MantineBadgeProps,
} from '@mantine/core';

export interface BadgeProps
  extends TwBaseProps,
    Omit<MantineBadgeProps, keyof Omit<GetStylesApiOptions, 'variant'>> {
  color?: FormattedColor;
  uppercase?: boolean;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ uppercase = true, ...rest }, ref) => {
    const textTransformStyle = uppercase ? {} : { textTransform: 'none' };

    // TODO: See what to do about the any
    return (
      <MantineBadge {...rest} ref={ref} style={{ ...textTransformStyle, fontWeight: 500 } as any} />
    );
  }
);
