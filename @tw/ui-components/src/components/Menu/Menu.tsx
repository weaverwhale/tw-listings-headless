import { FC, PropsWithChildren, forwardRef } from 'react';
import {
  Menu as MantineMenu,
  MenuProps as MantineMenuProps,
  MenuTargetProps as MantineMenuTargetProps,
  MenuDropdownProps as MantineMenuDropdownProps,
  MenuItemProps as MantineMenuItemProps,
  MenuDividerProps as MantineMenuDividerProps,
  MenuLabelProps as MantineMenuLabelProps,
} from '@mantine/core';
import { EventHandler, MantinePropsToRemove, TwBaseProps, TwStyleSystemProps } from '../../types';

export interface MenuProps
  extends TwBaseProps,
    PropsWithChildren,
    TwStyleSystemProps,
    Omit<MantineMenuProps, MantinePropsToRemove> {
}

interface IMenuTarget extends MantineMenuTargetProps {}
interface IMenuDropdown extends MantineMenuDropdownProps {}
interface IMenuLabel extends MantineMenuLabelProps {}
interface IMenuDivider extends MantineMenuDividerProps {}
interface IMenuItem extends MantineMenuItemProps, EventHandler<React.ButtonHTMLAttributes<HTMLButtonElement>> {}

interface IMenu extends FC<MenuProps> {
  Target: React.ForwardRefExoticComponent<IMenuTarget & React.RefAttributes<HTMLElement>>;
  Dropdown: FC<IMenuDropdown>;
  Item: FC<IMenuItem>;
  Label: FC<IMenuLabel>;
  Divider: FC<IMenuDivider>;
}

export const Menu: IMenu = (props) => <MantineMenu {...props} />;

Menu.Target = forwardRef<HTMLElement, IMenuTarget>((props, ref) => {
  return <MantineMenu.Target {...props} ref={ref} />;
});

Menu.Dropdown = (props: IMenuDropdown) => {
  return <MantineMenu.Dropdown {...props} />;
};

Menu.Item = (props: IMenuItem) => {
  return <MantineMenu.Item {...props} />;
};

Menu.Label = (props: IMenuLabel) => {
  return <MantineMenu.Label {...props} />;
};

Menu.Divider = (props: IMenuDivider) => {
  return <MantineMenu.Divider {...props} />;
};
