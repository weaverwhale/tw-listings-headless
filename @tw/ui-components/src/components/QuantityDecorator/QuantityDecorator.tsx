import { PropsWithChildren, forwardRef } from 'react';
import { FormattedColor, TwBaseProps } from '../../types';
import { Box, MantineTheme } from '@mantine/core';
import { QuantityDecoratorComputer } from './QuantityDecoratorComputer';

export interface QuantityDecoratorProps extends TwBaseProps, PropsWithChildren {
  quantity: number | string;
  size?: 'sm'; // TODO: change to Size when we have all sizes
  color?: FormattedColor;
  showOnZero?: boolean;
}

export const QuantityDecorator = forwardRef<HTMLDivElement, QuantityDecoratorProps>(
  (props, ref) => {
    const { children, quantity, size, color, showOnZero = false } = props;

    return (
      <Box ref={ref} pos="relative" display="inline-block">
        {children}

        {!!(showOnZero || quantity) && (
          <Box
            component="div"
            style={(theme: MantineTheme) => {
              const style = new QuantityDecoratorComputer(theme, { size, color });

              return {
                ...style.basicStyle,
                ...style.colorStyle,
                ...style.sizeStyle,
                ...style.borderStyle,
                position: 'absolute',
                boxSizing: 'unset',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                right: 0,
                top: 0,
                borderRadius: '50%',
                transform: 'translate(20%, -30%)',
              };
            }}
          >
            {quantity}
          </Box>
        )}
      </Box>
    );
  }
);
