import {
  Transition as MantineTransition,
  TransitionProps as MantineTransitionProps,
} from '@mantine/core';
import { TwBaseProps } from '../../types';

export interface TransitionProps extends TwBaseProps, MantineTransitionProps {}

export const Transition: React.FC<TransitionProps> = (props) => {
  return <MantineTransition {...props} data-tw-ui-component="Transition" />;
};
