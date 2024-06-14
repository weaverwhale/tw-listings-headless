import {
  GetStylesApiOptions,
  AppShell as MantineAppShell,
  AppShellProps as MantineAppShellProps,
} from '@mantine/core';
import { TwBaseProps, TwCustomStyleSystemProps } from '../../types';
import { PropsWithChildren, forwardRef } from 'react';
import { extractAndMapCustomPropsToStyle } from '../../utils';
import { PropsFrom } from '../..';

export interface IAppShellSection
  extends Omit<PropsFrom<typeof MantineAppShell.Section>, keyof GetStylesApiOptions>,
    PropsWithChildren,
    TwBaseProps,
    TwCustomStyleSystemProps {}

export interface AppShellProps
  extends TwBaseProps,
    Omit<MantineAppShellProps, keyof GetStylesApiOptions> {}

interface IAppShell extends React.FC<AppShellProps> {
  Section: React.ForwardRefExoticComponent<IAppShellSection & React.RefAttributes<HTMLDivElement>>;
}

export const AppShell: IAppShell = (props) => {
  return <MantineAppShell {...props} />;
};

AppShell.Section = forwardRef<HTMLDivElement, IAppShellSection>((props, ref) => {
  const { rest, style } = extractAndMapCustomPropsToStyle(props);
  return <MantineAppShell.Section ref={ref} {...rest} style={style} />;
});
