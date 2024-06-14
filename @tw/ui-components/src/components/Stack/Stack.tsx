import { Stack as MantineStack, StackProps as MantineStackProps } from '@mantine/core';
import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps, TwStyleSystemProps } from '../../types';

export interface StackProps
  extends TwBaseProps,
    TwStyleSystemProps,
    PropsWithChildren,
    Pick<MantineStackProps, 'variant' | 'gap' | 'align' | 'justify' | 'style'> {}

export const Stack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  return <MantineStack {...props} ref={ref} />;
});
