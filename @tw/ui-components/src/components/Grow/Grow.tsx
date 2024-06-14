import { Box as MantineBox, BoxProps as MantineBoxProps, GetStylesApiOptions } from '@mantine/core';
import { PropsWithChildren, forwardRef, CSSProperties } from 'react';
import {
  EventHandler,
  TwBaseProps,
  TwCustomStyleSystemProps,
  TwPolymorphicComponent,
} from '../../types';
import { extractAndMapCustomPropsToStyle } from '../../utils';

export interface GrowProps
  extends TwBaseProps,
    PropsWithChildren,
    TwPolymorphicComponent,
    EventHandler<React.BaseHTMLAttributes<HTMLElement>>,
    Omit<MantineBoxProps, keyof GetStylesApiOptions>,
    TwCustomStyleSystemProps {
  grow?: CSSProperties['flexGrow'];
}

export const Grow = forwardRef<any, GrowProps>((props, ref) => {
  const {
    rest: { as, grow, ...rest },
    style,
  } = extractAndMapCustomPropsToStyle(props);
  return (
    <MantineBox
      ref={ref}
      // TODO: See if this can be fixed from any
      component={(as || 'div') as any}
      {...rest}
      style={{ ...style, flexGrow: grow || 1 }}
    />
  );
});
