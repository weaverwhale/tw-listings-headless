import { forwardRef } from 'react';
import { AppShell, AppShellMainProps, MantineSpacing } from '@mantine/core';
import { MantinePropsToRemove, TwBaseProps, TwStyleSystemProps } from '../../types';

export interface MainProps
  extends TwBaseProps,
    Omit<TwStyleSystemProps, 'pl'>,
    Omit<AppShellMainProps, MantinePropsToRemove> {
  pl?: MantineSpacing;
}

export const Main = forwardRef<HTMLElement, MainProps>((props, ref) => {
  return <AppShell.Main {...props} ref={ref} />;
});
