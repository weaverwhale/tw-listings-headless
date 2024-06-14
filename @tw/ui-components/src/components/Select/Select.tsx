import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps, TwStyleSystemProps } from '../../types';
import {
  Select as MantineSelect,
  type SelectProps as MantineSelectProps,
  type GetStylesApiOptions,
  MantineStyleProps,
} from '@mantine/core';
import { vars } from '../../theme';
import * as classes from './Select.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { borderColor, minDropdownWidth } from './dynamic-vars.css';
import { cx } from '../../utils/cx';
import { useDedupedComboboxData } from '../../hooks/useDedupedComboboxData';

export interface SelectProps
  extends TwBaseProps,
    PropsWithChildren,
    TwStyleSystemProps,
    Omit<MantineSelectProps, keyof Omit<GetStylesApiOptions, 'styles'> | keyof MantineStyleProps> {
  focusStyles?: boolean;
  withBorder?: boolean;
  minDropdownWidth?: number | string;
  fw?: string | number;
  /** Determines whether it should be possible to deselect value by clicking on the selected option, false by default */
  allowDeselect?: boolean;
}

export const Select = forwardRef<HTMLInputElement, SelectProps>((props, ref) => {
  const {
    focusStyles = false,
    withBorder = true,
    minDropdownWidth: _minDropdownWidth,
    fw = 400 as any,
    allowDeselect = false,
    data,
    comboboxProps,
    ...rest
  } = props;

  const dedupedData = useDedupedComboboxData(data);

  return (
    <MantineSelect
      ref={ref}
      {...rest}
      data={dedupedData}
      allowDeselect={allowDeselect}
      style={assignInlineVars({
        [borderColor]: withBorder ? vars.colors.named2[3] : 'transparent',
        ...(_minDropdownWidth && { [minDropdownWidth]: _minDropdownWidth + 'px' }),
      })}
      comboboxProps={{
        ...comboboxProps,
        styles() {
          return {
            dropdown: assignInlineVars({
              [borderColor]: withBorder ? vars.colors.named2[3] : 'transparent',
            }),
          };
        },
      }}
      classNames={{
        dropdown: classes.dropdown,
        input: cx(classes.input, !focusStyles && classes.inputFocus),
        option: classes.option,
        section: classes.section,
      }}
    />
  );
});
