import { PropsWithChildren } from 'react';
import { Drawer as MantineDrawer, DrawerProps as MantineDrawerProps } from '@mantine/core';
import { MantinePropsToRemove, TwBaseProps, TwStyleSystemProps } from '../../types';
import { extractCSSColor } from '../../utils';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { drawer, drawerBg, hiddenScroll } from './Drawer.css';
import { cx } from '../../utils/cx';

export interface DrawerProps
  extends TwBaseProps,
    TwStyleSystemProps,
    PropsWithChildren,
    Omit<MantineDrawerProps, MantinePropsToRemove> {
  withScrollbar?: boolean;
}

export const Drawer = (props: DrawerProps) => {
  const { bg, withScrollbar = false, ...rest } = props;

  return (
    <MantineDrawer
      style={assignInlineVars({
        [drawerBg]: extractCSSColor(bg || 'white'),
      })}
      classNames={{ content: cx(drawer, !withScrollbar && hiddenScroll) }}
      {...rest}
    />
  );
};
