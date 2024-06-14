import { FC } from 'react';
import {
  TwBaseProps,
  FormattedColor,
  TWOnChange,
  TwStyleSystemProps,
  MantinePropsToRemove,
} from '../../types';
import {
  Checkbox as MantineCheckbox,
  CheckboxProps as MantineCheckboxProps,
  CheckboxGroupProps as MantineCheckboxGroupProps,
} from '@mantine/core';
import { wrapCheckboxOnChange } from '../../utils/inputElementEvents';
import { PropsFrom } from '../../utility-types';
import * as classes from './styles.css';

interface ICheckbox extends FC<CheckboxProps> {
  Group: FC<PropsFrom<typeof MantineCheckbox.Group> & CheckboxGroupProps>;
}

export interface CheckboxGroupProps
  extends TwBaseProps,
    TwStyleSystemProps,
    Omit<MantineCheckboxGroupProps, MantinePropsToRemove> {}

export interface CheckboxProps
  extends TwBaseProps,
    TwStyleSystemProps,
    Omit<MantineCheckboxProps, MantinePropsToRemove | 'color' | 'onChange'> {
  color?: FormattedColor;
  onChange?: TWOnChange<boolean>;
}

const Checkbox: ICheckbox = (props) => {
  return (
    <MantineCheckbox
      {...props}
      onChange={wrapCheckboxOnChange(props.onChange)}
      classNames={{ input: classes.checkboxInput, label: classes.label }}
    />
  );
};

Checkbox.Group = (props: CheckboxGroupProps) => {
  return <MantineCheckbox.Group {...props} />;
};

export { Checkbox };
