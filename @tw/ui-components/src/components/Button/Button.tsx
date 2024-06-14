import { isValidElement, useMemo } from 'react';
import { Button as MantineButton } from '@mantine/core';
import type {
  Size,
  TwBaseProps,
  FormattedColor,
  TwCustomStyleSystemProps,
  IconName,
  TwStyleSystemProps,
  MantinePropsToRemove,
} from '../../types';
import { PropsWithChildren, forwardRef } from 'react';
import {
  extractAndMapCustomPropsToStyle,
  extractCSSColor,
  extractIcon,
  isDefined,
} from '../../utils';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { PropsFrom } from '../../utility-types';
import * as classes from './variants';
import { buttonBgColor, buttonOutlineColor } from './dynamic-vars.css';
import { DEFAULT_RADIUS, vars } from '../../theme';
import { getMarketingProps } from '../../utils/commonPropGenerators';

export type ButtonRadius = 'default' | 'round';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'white'
  | 'gradient'
  | 'activator'
  | 'danger'
  | 'warning';

export interface ButtonProps
  extends TwBaseProps,
    TwStyleSystemProps,
    TwCustomStyleSystemProps,
    PropsWithChildren,
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<PropsFrom<typeof MantineButton>, MantinePropsToRemove> {
  variant?: ButtonVariant;
  radius?: ButtonRadius;
  size?: Exclude<Size, 0>;
  color?: FormattedColor;
  /** Generally used for icons - hence icon name is a possibility here, but you can put any JSX.Element as well. */
  leftSection?: JSX.Element | IconName | null;
  /** Generally used for icons - hence icon name is a possibility here, but you can put any JSX.Element as well. */
  rightSection?: JSX.Element | IconName | null;
  forceColorScheme?: 'dark' | 'light';
  compact?: boolean;
}

// map between our variants to equivalent mantine names
const TW_MANTINE_VARIANT = {
  primary: 'filled',
  activator: 'filled',
  secondary: 'outline',
  white: 'default',
  gradient: 'gradient',
  danger: 'outline',
  warning: 'outline',
} as const;

// We do a mixture of default Mantine styles per variant,
// and some custom styles to override some of those defaults.
const VARIANT_STYLE_OVERRIDE = {
  primary: classes.primary,
  secondary: classes.secondary,
  white: classes.white,
  activator: classes.activator,
  gradient: classes.gradient,
  danger: classes.danger,
  warning: classes.warning,
} as const;

/** Helper function to handle different types of input for left and right sections. */
const extractSideSection = (
  sectionContent?: JSX.Element | IconName | null,
  options: object = {}
): JSX.Element | null => {
  if (!isDefined(sectionContent)) return null;
  if (isValidElement(sectionContent)) return sectionContent;
  return extractIcon(sectionContent, options);
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = 'primary',
    size = 'sm',
    'data-testid': dataTestId = 'button',
    leftSection,
    rightSection,
    disabled = false,
    compact = false,
    color = 'one.5',
    radius = 'default',
    forceColorScheme,
    ...other
  } = extractAndMapCustomPropsToStyle(props).rest;
  const parsedColor = useMemo(() => extractCSSColor(color), [color]);

  return (
    <MantineButton
      variant={TW_MANTINE_VARIANT[variant]}
      leftSection={extractSideSection(leftSection, {
        size: 12,
        disabled,
        color: variant === 'activator' ? undefined : 'inherit',
      })}
      rightSection={extractSideSection(rightSection, {
        size: 12,
        disabled,
        color: variant === 'activator' ? undefined : 'inherit',
      })}
      radius={vars.radius[radius === 'round' ? 'round' : DEFAULT_RADIUS]}
      /** Mantine uses this "compact" prefix to convert the button to a compact element */
      size={compact ? `compact-${size}` : size}
      disabled={disabled}
      data-testid={dataTestId}
      ref={ref}
      style={assignInlineVars({
        [buttonBgColor]: parsedColor,
        [buttonOutlineColor]: parsedColor,
      })}
      styles={{ label: { fontSize: vars.fontSizes.sm, fontWeight: 500 } }}
      className={VARIANT_STYLE_OVERRIDE[variant]}
      data-tw-ui-component="Button"
      {...(forceColorScheme && { 'data-clr-scheme': forceColorScheme })}
      {...getMarketingProps(`button-${props.children}`)}
      {...other}
    />
  );
});
