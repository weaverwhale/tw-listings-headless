import { forwardRef } from 'react';
import { MantinePropsToRemove, Size, TwBaseProps, TwStyleSystemProps } from '../../types';
import { Image as MantineImage, ImageProps as MantineImageProps } from '@mantine/core';
import * as classes from './Image.css';
import { vars } from '../../theme';
import { PropsFrom } from '../../utility-types';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { imageBoxShadow, shadowBorderRadius } from './dynamic-vars.css';
import { cx } from '../../utils/cx';

import defaultImage from '../../assets/image-placeholder.png';

/**
 * Mantine allows any amount of props to different elements.
 * This comes with some lack of type safety however, and we still
 * want to limit the props devs can pass.  Here, we're taking all
 * other valid React HTML Image attributes that aren't customized by
 * Mantine or specifically customized by us and used by HTML already
 * and saying they're valid props. This still gives better type safety.
 */
type HTMLOnlyImgAttributes = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  keyof PropsFrom<typeof MantineImage> | 'width'
>;

export interface ImageProps
  extends TwBaseProps,
    TwStyleSystemProps,
    HTMLOnlyImgAttributes,
    Omit<PropsFrom<typeof MantineImage>, MantinePropsToRemove> {
  shadowBorderSize?: Exclude<Size, 0>;
  width?: MantineImageProps['w'];
}

export const Image = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const { shadowBorderSize, width, ...rest } = props;

  return (
    <MantineImage
      fallbackSrc={defaultImage}
      {...rest}
      w={props.w ?? width}
      ref={ref}
      style={
        shadowBorderSize &&
        assignInlineVars({
          [shadowBorderRadius]: vars.radius[shadowBorderSize],
          [imageBoxShadow]: vars.shadows[shadowBorderSize],
        })
      }
      className={cx(!!shadowBorderSize && classes.shadowBorder)}
    />
  );
});
