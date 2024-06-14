import { PropsWithChildren, forwardRef } from 'react';
import { EventHandler, TwBaseProps } from '../../types';
import { Collapse as MantineCollapse, CollapseProps as MantineCollapseProps } from '@mantine/core';

export interface CollapseProps
  extends TwBaseProps,
    PropsWithChildren,
    Pick<
      MantineCollapseProps,
      | 'in'
      | 'transitionDuration'
      | 'transitionTimingFunction'
      | 'animateOpacity'
      | 'onTransitionEnd'
    >,
    Omit<EventHandler<React.ComponentPropsWithoutRef<'div'>>, 'onTransitionEnd'> {
  children: React.ReactNode;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>((props, ref) => {
  return <MantineCollapse {...props} ref={ref} />;
});
