import { PropsWithChildren, forwardRef, useEffect } from 'react';
import { TwBaseProps } from '../../types';
import {
  GetStylesApiOptions,
  MultiSelect as MantineMultiSelect,
  MultiSelectProps as MantineMultiSelectProps,
} from '@mantine/core';
import { useDedupedComboboxData } from '../../hooks/useDedupedComboboxData';

export interface MultiSelectProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<MantineMultiSelectProps, keyof Omit<GetStylesApiOptions, 'styles'>> {}

export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>((props, ref) => {
  useEffect(() => {
    if (Array.isArray(props.value)) return;

    console.warn(
      `Incorrect data passed to UI Component - "Multiselect" - must be of type "string[]"`
    );
  }, [props.value]);

  const data = useDedupedComboboxData(props.data);

  return (
    <MantineMultiSelect
      {...props}
      ref={ref}
      data={data}
      value={Array.isArray(props.value) ? [...new Set(props.value)] : []}
    />
  );
});
