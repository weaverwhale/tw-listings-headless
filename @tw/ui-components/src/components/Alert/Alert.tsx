import { PropsWithChildren, forwardRef } from 'react';
import { Alert as MantineAlert, AlertProps as MantineAlertProps } from '@mantine/core';
import { TwBaseProps, FormattedColor } from '../../types';

export interface AlertProps
  extends TwBaseProps,
    PropsWithChildren,
    Pick<
      MantineAlertProps,
      'title' | 'icon' | 'onClose' | 'withCloseButton' | 'closeButtonLabel' | 'variant'
    > {
  children: React.ReactNode;
  color?: FormattedColor;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MantineAlert {...props} ref={ref} />;
});
