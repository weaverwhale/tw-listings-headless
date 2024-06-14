import React, { PropsWithChildren, forwardRef, useMemo } from 'react';
import { Switch as MantineSwitch, SwitchProps as MantineSwitchProps } from '@mantine/core';
import { Text } from '../Text/Text';
import { EventHandler, FormattedColor, Size, TwBaseProps } from '../../types';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import {
  trackHeight,
  trackWidth,
  onColor as _onColor,
  offColor as _offColor,
  thumbSize,
} from './dynamic-vars.css';
import { cx } from '../../utils/cx';
import * as classes from './styles';
import { extractCSSColor } from '../../utils';
import { useColorScheme } from '../../hooks';

export type SwitchVariants = 'simple' | 'short';

export interface SwitchProps
  extends TwBaseProps,
    PropsWithChildren,
    EventHandler<React.InputHTMLAttributes<HTMLInputElement>>,
    Pick<
      MantineSwitchProps,
      'checked' | 'labelPosition' | 'label' | 'description' | 'disabled' | 'thumbIcon'
    > {
  variant?: SwitchVariants;
  size?: Exclude<Size, 0>;
  /** Automatically used as "onColor" and "offColor" */
  color?: FormattedColor;
  onColor?: FormattedColor;
  offColor?: FormattedColor;
  withOutline?: boolean;
}

const TRACK_SIZES = {
  xs: { width: '1.125rem', height: '0.5rem' },
  sm: { width: '1.75rem', height: '0.75rem' },
  md: { width: '2.25rem', height: '1rem' },
  lg: { width: '2.875rem', height: '1.25rem' },
  xl: { width: '3.375rem', height: '1.5rem' },
} as const;

const THUMB_SIZES = {
  xs: '0.625rem',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
  xl: '1.875rem',
} as const;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
  const {
    size = 'md',
    'data-testid': dataTestId = 'switch',
    labelPosition = 'right',
    label,
    color = 'one.6',
    onColor,
    offColor,
    checked,
    withOutline = false,
    ...other
  } = props;

  const darkMode = useColorScheme().colorScheme === 'dark';
  const extractedOnColor = useMemo(() => extractCSSColor(onColor ?? color), [onColor, color]);
  const extractedOffColor = useMemo(
    () => extractCSSColor(offColor ?? (darkMode ? 'gray.5' : 'gray.2')),
    [offColor, darkMode]
  );

  return (
    <MantineSwitch
      {...{
        size,
        labelPosition,
        checked,
        'data-testid': dataTestId,
        ...other,
        variant: other.variant || 'simple',
      }}
      label={label ? <Text>{label}</Text> : null}
      style={assignInlineVars({
        [thumbSize]: THUMB_SIZES[size],
        [trackWidth]: TRACK_SIZES[size].width,
        [trackHeight]: TRACK_SIZES[size].height,
        [_onColor]: extractedOnColor,
        [_offColor]: extractedOffColor,
      })}
      classNames={{
        track: cx(
          classes.track,
          other.variant === 'short' && classes.shortTrack,
          checked && [classes.checked, withOutline && classes.checkedWithOutline]
        ),
        thumb: cx(
          classes.thumb,
          other.variant === 'short' && [classes.shortThumb, checked && classes.shortThumbChecked]
        ),
      }}
      ref={ref}
    />
  );
});
