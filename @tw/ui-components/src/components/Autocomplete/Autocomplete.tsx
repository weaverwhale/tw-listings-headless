import {
  GetStylesApiOptions,
  Autocomplete as MantineAutocomplete,
  AutocompleteProps as MantineAutocompleteProps,
} from '@mantine/core';
import { forwardRef } from 'react';
import { TwBaseProps } from '../../types';
import * as classes from './Autocomplete.css';
import { cx } from '../../utils/cx';
import { useDedupedComboboxStringData } from '../../hooks/useDedupedComboboxData';

export type AutocompleteItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface AutocompleteProps
  extends TwBaseProps,
    Omit<MantineAutocompleteProps, keyof GetStylesApiOptions> {
  icon?: MantineAutocompleteProps['leftSection'];
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ data, ...props }, ref) => {
    const dedupedData = useDedupedComboboxStringData(data);

    return (
      <MantineAutocomplete
        {...props}
        data={dedupedData}
        ref={ref}
        classNames={{
          dropdown: classes.dropdown,
          option: classes.option,
          input: cx(classes.input, !!props.error && classes.inputWithError),
          error: classes.error,
          section: props.error ? classes.sectionWithError : '',
        }}
      />
    );
  }
);
