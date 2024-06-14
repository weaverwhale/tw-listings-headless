import { forwardRef } from 'react';
import { MonthPicker as MantineMonthPicker } from '@mantine/dates';
import { TwBaseProps } from '../../types';
import { getMarketingProps } from '../../utils/commonPropGenerators';
import { PropsFrom } from '../../utility-types';

export interface MonthPickerProps
  extends TwBaseProps,
    Pick<
      PropsFrom<typeof MantineMonthPicker>,
      | 'minDate'
      | 'maxDate'
      | 'onChange'
      | 'value'
      | 'type'
      | 'onDateChange'
      | 'maxDate'
      | 'date'
      | 'allowDeselect'
      | 'allowSingleDateInRange'
    > {}

export const MonthPicker = forwardRef<HTMLDivElement, MonthPickerProps>((props, ref) => {
  return (
    <MantineMonthPicker
      ref={ref}
      data-tw-ui-component="MonthPicker"
      {...getMarketingProps('month-picker')}
      {...props}
    />
  );
});
