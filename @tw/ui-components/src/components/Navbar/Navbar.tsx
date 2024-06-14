import { AppShell as MantineAppShell, AppShellNavbarProps } from '@mantine/core';
import {
  FormattedColor,
  MantinePropsToRemove,
  TwBaseProps,
  TwCustomStyleSystemProps,
  TwStyleSystemProps,
} from '../../types';
import { extractAndMapCustomPropsToStyle } from '../../utils';
import { Override } from '../../utility-types';

export interface NavbarProps
  extends TwBaseProps,
    TwCustomStyleSystemProps,
    Override<TwStyleSystemProps, { bg?: FormattedColor | (string & {}) }>,
    Omit<AppShellNavbarProps, MantinePropsToRemove> {}

export const Navbar: React.FC<NavbarProps> = (props) => {
  const { style, rest } = extractAndMapCustomPropsToStyle(props);
  return <MantineAppShell.Navbar {...rest} style={style} />;
};
