import { PropsWithChildren, forwardRef } from 'react';
import {
  LoaderProps,
  LoadingOverlay as MantineLoadingOverlay,
  LoadingOverlayProps as MantineLoadingOverlayProps,
  OverlayProps,
} from '@mantine/core';
import { TwBaseProps, Size, MantinePropsToRemove, FormattedColor } from '../../types';
import { Override } from '../../utility-types';

type FormattedColorProps = { color?: FormattedColor; c?: FormattedColor; bg?: FormattedColor };

export interface LoadingOverlayProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<MantineLoadingOverlayProps, MantinePropsToRemove> {
  radius?: Size;
  loaderProps?: Override<LoaderProps, FormattedColorProps>;
  overlayProps?: Override<OverlayProps, FormattedColorProps>;
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>((props, ref) => {
  return <MantineLoadingOverlay {...props} ref={ref} />;
});
