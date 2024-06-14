import {
  Flex as MantineFlex,
  FlexProps as MantineFlexProps,
} from '@mantine/core';
import { CSSProperties, PropsWithChildren, forwardRef } from 'react';
import {
  MantinePropsToRemove,
  Size,
  TwBaseProps,
  TwCustomStyleSystemProps,
  TwStyleSystemProps,
} from '../../types';
import { extractAndMapCustomPropsToStyle } from '../../utils';

export interface FlexProps
  extends TwBaseProps,
    TwStyleSystemProps,
    TwCustomStyleSystemProps,
    PropsWithChildren,
    Omit<MantineFlexProps, MantinePropsToRemove> {
  gap?: Size;
  rowGap?: Size;
  columnGap?: Size;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: CSSProperties['flexWrap'];
  direction?: CSSProperties['flexDirection'];
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  const { rest, style } = extractAndMapCustomPropsToStyle(props);
  return <MantineFlex {...rest} style={style} ref={ref} />;
});
