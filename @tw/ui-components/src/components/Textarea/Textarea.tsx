import { forwardRef, useMemo } from 'react';
import {
  Textarea as MantineTextarea,
  TextareaProps as MantineTextareaProps,
} from '@mantine/core';
import { EventHandler, TwBaseProps, TwStyleSystemProps } from '../../types';

// NOTE: Some common functions that are used to generate common custom props
import { getMarketingProps } from '../../utils/commonPropGenerators';
import { extractCSSColor } from '../../utils';
import { DEFAULT_RADIUS, vars } from '../../theme';
import { useColorScheme } from '../../hooks';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import {
  errorStyle,
  input,
  inputBgClr,
  inputClr,
  inputWithBorder,
  inputWithError,
} from './Textarea.css';
import { cx } from '../../utils/cx';

export interface TextareaProps
  extends TwBaseProps,
    TwStyleSystemProps,
    EventHandler<React.TextareaHTMLAttributes<HTMLTextAreaElement>>,
    Pick<
      MantineTextareaProps,
      'value' | 'label' | 'placeholder' | 'description' | 'size' | 'error' | 'disabled' | 'radius' | 'required' | 'autosize' | 'autoFocus' | 'minRows' | 'maxRows'
    > {
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const {
    radius = DEFAULT_RADIUS,
    error,
    bg,
    c,
    ...other
  } = props;
  const isDarkMode = useColorScheme().colorScheme === 'dark';

  const _inputClr = useMemo(() => {
    if (c) return extractCSSColor(c);
    return isDarkMode ? vars.colors.gray[0] : vars.colors.gray[7];
  }, [isDarkMode, c]);

  const _inputBgClr = useMemo(() => {
    if (bg) return extractCSSColor(bg);
    return isDarkMode ? vars.colors.gray[6] : vars.colors.white;
  }, [isDarkMode, bg]);

  return (
    <MantineTextarea
      {...other}
      error={error}
      ref={ref}
      radius={radius}
      data-tw-ui-component="Textarea"
      styles={{
        label: {
          width: '100%',
        },
      }}
      classNames={{
        input: cx(input, inputWithBorder, !!error && inputWithError),
        error: errorStyle,
      }}
      style={assignInlineVars({
        [inputClr]: _inputClr,
        [inputBgClr]: _inputBgClr,
      })}
      {...getMarketingProps('textarea')}
    />
  )
});
