import { forwardRef } from 'react';
import {
  GetStylesApiOptions,
  PasswordInput as MantinePasswordInput,
  PasswordInputProps as MantinePasswordInputProps,
} from '@mantine/core';
import { EventHandler, TWOnChange, TwBaseProps } from '../../types';
import { getMarketingProps } from '../../utils/commonPropGenerators';
import { wrapInputOnChange } from '../../utils/inputElementEvents';
import { cx } from '../../utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useColorScheme } from '../../hooks';
import {
  input,
  inputBgClr,
  inputWithBorder,
  inputWithError,
  errorStyle,
  inputClr,
} from '../TextInput/TextInput.css';
import { vars } from '../../theme';
import { visibilityToggle } from './PasswordInput.css';

export interface PasswordInputProps
  extends TwBaseProps,
    Omit<EventHandler<React.InputHTMLAttributes<HTMLInputElement>>, 'onChange'>,
    Omit<MantinePasswordInputProps, keyof GetStylesApiOptions | 'onChange'> {
  onChange?: TWOnChange<string>;
  withBorder?: boolean;
  forceColorScheme?: 'light' | 'dark';
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const darkMode = useColorScheme().colorScheme === 'dark';
  const { radius = 'xs', error, onChange, withBorder = true, forceColorScheme, ...other } = props;

  return (
    <MantinePasswordInput
      {...other}
      error={error}
      inputWrapperOrder={['label', 'input', 'description', 'error']}
      radius={radius}
      // TODO: This kind of styling is in TextInput as well - refactor to make more dry
      style={assignInlineVars({
        [inputClr]:
          !darkMode || forceColorScheme === 'light' ? vars.colors.gray[7] : vars.colors.gray[0],
        [inputBgClr]:
          !darkMode || forceColorScheme === 'light' ? vars.colors.white : vars.colors.gray[6],
      })}
      classNames={{
        input: cx(input, withBorder && inputWithBorder, !!error && inputWithError),
        error: errorStyle,
        visibilityToggle: visibilityToggle,
      }}
      data-tw-ui-component="PasswordInput"
      ref={ref}
      onChange={wrapInputOnChange(onChange)}
      {...getMarketingProps(
        props.placeholder || props.id || props.value?.toString() || 'tw-password-input'
      )}
    />
  );
});
