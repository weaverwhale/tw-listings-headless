import { PropsWithChildren, forwardRef } from 'react';
import {
  Slider as MantineSlider,
  SliderProps as MantineSliderProps,
  GetStylesApiOptions,
} from '@mantine/core';
import { TwBaseProps, FormattedColor } from '../../types';

export interface SliderProps
  extends TwBaseProps,
    PropsWithChildren,
    Omit<MantineSliderProps, keyof GetStylesApiOptions> {
  color?: FormattedColor;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
  return <MantineSlider {...props} ref={ref} data-tw-ui-component="Slider" />;
});
