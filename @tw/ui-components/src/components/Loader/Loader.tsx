import { Loader as MantineLoader, LoaderProps as MantineLoaderProps } from '@mantine/core';
import { PropsWithChildren, forwardRef } from 'react';
import { FormattedColor, TwBaseProps } from '../../types';

// NOTE: Allowing size to be MantineSize, since we might need to make a loader a certain number of pixels tall/wide
export interface LoaderProps
  extends TwBaseProps,
    PropsWithChildren,
    Pick<MantineLoaderProps, 'variant' | 'size'> {
  color?: FormattedColor;
}

export const Loader = forwardRef<HTMLElement, LoaderProps>((props, ref) => {
  // setting defaults...
  const {
    size = 'md',
    color = 'one.6',
    variant = 'oval',
    'data-testid': dataTestId = 'loader',
    ...other
  } = props;

  return (
    <MantineLoader
      {...{
        size,
        color,
        'data-testid': dataTestId,
        variant,
        ...other,
      }}
      ref={ref}
    />
  );
});
