import { forwardRef } from 'react';
import { AppShell, AppShellHeaderProps } from '@mantine/core';
import {
  FormattedColor,
  MantinePropsToRemove,
  TwBaseProps,
  TwCustomStyleSystemProps,
  TwStyleSystemProps,
} from '../../types';
import { Override } from '../../utility-types';
import { extractAndMapCustomPropsToStyle } from '../../utils';

export interface HeaderProps
  extends TwBaseProps,
    TwCustomStyleSystemProps,
    Override<TwStyleSystemProps, { bg?: FormattedColor | (string & {}) }>,
    Omit<AppShellHeaderProps, MantinePropsToRemove> {}

export const Header = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
  const { style, rest } = extractAndMapCustomPropsToStyle(props);
  return <AppShell.Header {...rest} style={style} ref={ref} />;
});
