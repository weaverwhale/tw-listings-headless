import { Box as MantineBox, BoxProps as MantineBoxProps } from '@mantine/core';
import { PropsWithChildren, forwardRef } from 'react';
import {
  EventHandler,
  MantinePropsToRemove,
  TwBaseProps,
  TwCustomStyleSystemProps,
  TwPolymorphicComponent,
  TwStyleSystemProps,
} from '../../types';
import { extractAndMapCustomPropsToStyle } from '../../utils';
import * as classes from './Box.css';

// TODO: Need to see if to limit here
export interface BoxProps
  extends TwBaseProps,
    PropsWithChildren,
    TwPolymorphicComponent,
    EventHandler<React.BaseHTMLAttributes<HTMLElement>>,
    Omit<MantineBoxProps, MantinePropsToRemove>,
    TwStyleSystemProps,
    TwCustomStyleSystemProps {
  withScrollbar?: boolean;
}

export const Box = forwardRef<any, BoxProps>((props, ref) => {
  const {
    rest: { as, withScrollbar = true, ...rest },
    style,
  } = extractAndMapCustomPropsToStyle(props);
  return (
    <MantineBox
      ref={ref}
      // TODO: See if this can be fixed
      component={as as any}
      {...rest}
      style={style}
      className={!withScrollbar ? classes.hiddenScrollbar : ''}
    />
  );
});
