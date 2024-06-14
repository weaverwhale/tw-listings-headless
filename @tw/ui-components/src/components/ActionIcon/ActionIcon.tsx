import {
  ActionIcon as MantineActionIcon,
  ActionIconProps as MantineActionIconProps,
  ActionIconVariant as MantineActionIconVariant,
} from '@mantine/core';
import { forwardRef } from 'react';
import {
  EventHandler,
  FormattedColor,
  IconName,
  Size,
  TwBaseProps,
  TwStyleSystemProps,
} from '../../types';
import { useColorScheme } from '../../hooks';
import { extractCSSColor, extractIcon } from '../../utils';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { actionIconClr, borderRadius } from './dynamic-vars.css';
import { DEFAULT_RADIUS, vars } from '../../theme';
import { base, focusOutline } from './variants/base.css';
import { activator } from './variants/activator.css';
import { filled } from './variants/filled.css';

export type ActionIconVariant = Exclude<MantineActionIconVariant | 'activator', 'white'>;

export interface ActionIconProps
  extends TwBaseProps,
    TwStyleSystemProps,
    EventHandler<React.ButtonHTMLAttributes<HTMLButtonElement>>,
    Pick<MantineActionIconProps, 'disabled' | 'loaderProps' | 'loading' | 'gradient'> {
  variant?: ActionIconVariant;
  size?: Size;
  color?: FormattedColor;
  radius?: Size | 'round';
  outline?: boolean;
  icon?: JSX.Element | IconName;
  iconSize?: number;
  iconColor?: FormattedColor;
  pressed?: boolean; // TODO: This needs to give the illusion that the icon is pressed if true.
}

/** Function to get map of correct tw variant to Mantine variant - function bc of dark mode */
const getMantineVariant = (variant: ActionIconVariant, darkMode: boolean) => {
  return {
    subtle: 'subtle',
    filled: 'filled',
    outline: 'outline',
    light: 'light',
    default: 'default',
    transparent: 'transparent',
    gradient: 'gradient',
    activator: darkMode ? 'filled' : 'outline',
  }[variant];
};

/** Some variants don't allow custom icon colors */
const nonCustomIconClrVariants = new Set(['activator']);

export const ActionIcon = forwardRef<HTMLButtonElement, ActionIconProps>((props, ref) => {
  const {
    size = 'md',
    'data-testid': dataTestId = 'action-icon',
    variant = 'subtle',
    outline,
    radius = DEFAULT_RADIUS,
    color = 'one.6',
    icon,
    iconSize = 16,
    iconColor,
    disabled = false,
    ...other
  } = props;

  const darkMode = useColorScheme().colorScheme === 'dark';

  return (
    <MantineActionIcon
      ref={ref}
      {...{
        size,
        disabled,
        variant: getMantineVariant(variant, darkMode),
        'data-testid': dataTestId,
        style: assignInlineVars({
          [actionIconClr]: extractCSSColor(color),
          [borderRadius]: vars.radius[radius],
        }),
        children: extractIcon(icon, {
          size: iconSize,
          color: nonCustomIconClrVariants.has(variant) ? undefined : iconColor || props.color,
          disabled,
        }),
        className: variant === 'activator' ? activator : variant === 'filled' ? filled : props.outline ? focusOutline : base,
        ...other,
      }}
    />
  );
});
