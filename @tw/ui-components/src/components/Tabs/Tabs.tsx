import React, { CSSProperties, FC, forwardRef } from 'react';
import { TwBaseProps, FormattedColor, EventHandler } from '../../types';
import {
  Tabs as MantineTabs,
  TabsProps as MantineTabsProps,
  TabsListProps,
  TabsPanelProps,
  TabsTabProps,
  GetStylesApiOptions,
} from '@mantine/core';

export interface TabsProps
  extends TwBaseProps,
    Omit<EventHandler<React.HTMLAttributes<HTMLDivElement>>, 'onChange'>,
    Omit<MantineTabsProps, keyof GetStylesApiOptions> {
  color?: FormattedColor;
  fullWidth?: boolean;
}

interface ITabs extends React.FC<TabsProps> {
  Tab: React.ForwardRefExoticComponent<ITabsTabProps & React.RefAttributes<HTMLButtonElement>>;
  List: React.ForwardRefExoticComponent<ITabsListProps & React.RefAttributes<HTMLDivElement>>;
  Panel: FC<ITabsPanelProps>;
}

interface ITabsTabProps extends TabsTabProps {}
interface ITabsListProps extends TabsListProps {}
interface ITabsPanelProps extends TabsPanelProps {}

export const Tabs: ITabs = (props) => {
  const { fullWidth = false, ...rest } = props;
  const style: CSSProperties = fullWidth
    ? { width: '100%', overflowX: 'auto', display: 'flex' }
    : {};
  return <MantineTabs {...rest} style={style} />;
};

Tabs.Tab = forwardRef((props, ref) => {
  return <MantineTabs.Tab {...props} ref={ref} />;
});

Tabs.List = forwardRef((props, ref) => {
  return <MantineTabs.List {...props} ref={ref} />;
});

Tabs.Panel = (props) => {
  return <MantineTabs.Panel {...props} />;
};
