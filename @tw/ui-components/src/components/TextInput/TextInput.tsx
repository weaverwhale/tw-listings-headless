import { forwardRef, useMemo } from 'react';
import {
  TextInput as MantineTextInput,
  TextInputProps as MantineTextInputProps,
} from '@mantine/core';
import { EventHandler, IconName, TwBaseProps, TWOnChange, TwStyleSystemProps } from '../../types';
import { extractCSSColor, extractIcon } from '../../utils';
import { wrapInputOnChange } from '../../utils/inputElementEvents';
import { cx } from '../../utils/cx';
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
} from './TextInput.css';

export interface TextInputProps
  extends TwBaseProps,
    TwStyleSystemProps,
    Omit<EventHandler<React.InputHTMLAttributes<HTMLInputElement>>, 'onChange'>,
    Pick<
      MantineTextInputProps,
      | 'value'
      | 'label'
      | 'placeholder'
      | 'description'
      | 'type'
      | 'size'
      | 'error'
      | 'disabled'
      | 'radius'
      | 'required'
    > {
  forceColorScheme?: 'light' | 'dark';
  leadingIcon?: IconName | JSX.Element;
  trailingIcon?: IconName | JSX.Element;
  onChange?: TWOnChange<string>;
  withBorder?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const darkMode = useColorScheme().colorScheme === 'dark';

  const {
    leadingIcon: li,
    trailingIcon: ti,
    radius = DEFAULT_RADIUS,
    withBorder = true,
    error,
    onChange,
    forceColorScheme,
    bg,
    c,
    ...other
  } = props;
  const leadingIcon = useMemo(() => extractIcon(li), [li]);
  const trailingIcon = useMemo(() => extractIcon(ti), [ti]);

  const isDarkMode = darkMode && forceColorScheme !== 'light';

  const _inputClr = useMemo(() => {
    if (c) return extractCSSColor(c);
    return isDarkMode ? vars.colors.gray[0] : vars.colors.gray[7];
  }, [isDarkMode, c]);

  const _inputBgClr = useMemo(() => {
    if (bg) return extractCSSColor(bg);
    return isDarkMode ? vars.colors.gray[6] : vars.colors.white;
  }, [isDarkMode, bg]);

  return (
    <MantineTextInput
      {...other}
      error={error}
      leftSection={leadingIcon}
      rightSection={trailingIcon}
      inputWrapperOrder={['label', 'input', 'description', 'error']}
      radius={radius}
      styles={{
        label: {
          width: '100%',
        },
      }}
      style={assignInlineVars({
        [inputClr]: _inputClr,
        [inputBgClr]: _inputBgClr,
      })}
      classNames={{
        input: cx(input, withBorder && inputWithBorder, !!error && inputWithError),
        error: errorStyle,
      }}
      ref={ref}
      onChange={wrapInputOnChange(onChange)}
    />
  );
});
