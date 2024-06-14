import { forwardRef, useMemo } from 'react';
import {
  MantinePropsToRemove,
  TwBaseProps,
  TwCustomStyleSystemProps,
  TwStyleSystemProps,
} from '../../types';
import {
  Popover as MantinePopover,
  PopoverProps as MantinePopoverProps,
  PopoverTargetProps as MantinePopoverTargetProps,
  PopoverDropdownProps as MantinePopoverDropdownProps,
} from '@mantine/core';
import { extractAndMapCustomPropsToStyle } from '../..';

export type PopoverProps = TwBaseProps &
  TwStyleSystemProps &
  Omit<MantinePopoverProps, MantinePropsToRemove>;

export type PopoverTargetProps = TwBaseProps &
  TwStyleSystemProps &
  Omit<MantinePopoverTargetProps, MantinePropsToRemove>;

export type PopoverDropdownProps = TwBaseProps &
  TwStyleSystemProps &
  TwCustomStyleSystemProps &
  Omit<MantinePopoverDropdownProps, MantinePropsToRemove>;

const BasePopover = (props: PopoverProps) => <MantinePopover {...props} />;

const PopoverTarget = forwardRef<HTMLElement, PopoverTargetProps>((props, ref) => {
  return <MantinePopover.Target {...props} ref={ref} />;
});

const PopoverDropdown = forwardRef<HTMLDivElement, PopoverDropdownProps>((props, ref) => {
  const { rest, style } = useMemo(() => extractAndMapCustomPropsToStyle(props), [props]);
  return <MantinePopover.Dropdown ref={ref} {...rest} style={style} />;
});

type PopoverComponent = typeof BasePopover & {
  Target: typeof PopoverTarget;
  Dropdown: typeof PopoverDropdown;
};

export const Popover: PopoverComponent = Object.assign(BasePopover, {
  Target: PopoverTarget,
  Dropdown: PopoverDropdown,
}) as PopoverComponent;
