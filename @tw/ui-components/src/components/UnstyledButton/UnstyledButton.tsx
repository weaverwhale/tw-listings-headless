import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps, FormattedColor, EventHandler } from '../../types';
import {
  GetStylesApiOptions,
  UnstyledButton as MantineUnstyledButton,
  UnstyledButtonProps as MantineUnstyledButtonProps,
} from '@mantine/core';

export interface UnstyledButtonProps
  extends TwBaseProps,
    PropsWithChildren,
    EventHandler<React.ButtonHTMLAttributes<HTMLButtonElement>>,
    Omit<MantineUnstyledButtonProps, keyof GetStylesApiOptions> {
  color?: FormattedColor;
}

export const UnstyledButton = forwardRef<HTMLButtonElement, UnstyledButtonProps>((props, ref) => {
  return <MantineUnstyledButton {...props} ref={ref} />;
});
