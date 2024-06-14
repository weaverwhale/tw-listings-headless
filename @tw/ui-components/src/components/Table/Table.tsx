import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps } from '../../types';
import {
  Table as MantineTable,
  TableProps as MantineTableProps,
  GetStylesApiOptions,
} from '@mantine/core';

export interface TableProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<MantineTableProps, keyof GetStylesApiOptions> {
  withBorder?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(({ withBorder, ...props }, ref) => {
  props.withTableBorder = withBorder ?? props.withTableBorder ?? false;

  return <MantineTable {...props} ref={ref} />;
});
