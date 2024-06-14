import { PropsWithChildren, forwardRef } from 'react';
import { FormattedColor, TwBaseProps } from '../../types';
import { Skeleton as MantineSkeleton, SkeletonProps as MantineSkeletonProps } from '@mantine/core';
import { skeleton, skeletonAfterColor, skeletonBeforeColor } from './Skeleton.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { extractCSSColor } from '../../utils';

export interface SkeletonProps
  extends TwBaseProps,
    PropsWithChildren,
    Pick<MantineSkeletonProps, 'visible' | 'height' | 'width' | 'circle' | 'radius' | 'animate'> {
  /**
   * @description First color in animation
   */
  beforeColor?: FormattedColor;
  /**
   * @description Second color in animation
   */
  afterColor?: FormattedColor;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ beforeColor, afterColor, ...props }, ref) => {
    return (
      <MantineSkeleton
        {...props}
        ref={ref}
        style={assignInlineVars({
          [skeletonBeforeColor]: beforeColor && extractCSSColor(beforeColor),
          [skeletonAfterColor]: afterColor && extractCSSColor(afterColor),
        })}
        className={skeleton}
      />
    );
  }
);
