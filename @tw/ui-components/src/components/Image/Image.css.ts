import { style } from '@vanilla-extract/css';
import { imageBoxShadow, shadowBorderRadius } from './dynamic-vars.css';

export const shadowBorder = style({
  borderRadius: shadowBorderRadius,
  boxShadow: imageBoxShadow,
  border: '1px solid white',
});
