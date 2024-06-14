import {
  Container as MantineContainer,
  ContainerProps as MantineContainerProps,
} from '@mantine/core';
import { PropsWithChildren, forwardRef } from 'react';
import { Size, TwBaseProps } from '../../types';

// TODO: See what to limit here
export interface ContainerProps extends TwBaseProps, PropsWithChildren, MantineContainerProps {
  size?: Size;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  return <MantineContainer {...props} ref={ref} />;
});
