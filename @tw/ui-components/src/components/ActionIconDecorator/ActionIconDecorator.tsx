import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps } from '../../types';
import { Box } from '@mantine/core';
import { ActionIcon, ActionIconProps } from '..';

export interface ActionIconDecoratorProps extends TwBaseProps, PropsWithChildren {
  actionIconProps: ActionIconProps;
  position?: 'top' | 'bottom';
}

export const ActionIconDecorator = forwardRef<HTMLDivElement, ActionIconDecoratorProps>(
  (props, ref) => {
    const { actionIconProps, position = 'top', children = false } = props;

    return (
      <Box ref={ref} pos="relative" display="inline-block">
        {children}
        <div
          style={{
            position: 'absolute',
            boxSizing: 'unset',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            right: 0,
            ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
            borderRadius: '50%',
            transform: `translate(20%, ${position === 'top' ? '-' : ''}30%)`,
          }}
        >
          <ActionIcon variant="default" radius="round" {...actionIconProps} />
        </div>
      </Box>
    );
  }
);
