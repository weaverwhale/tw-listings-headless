import { style } from '@vanilla-extract/css';
import { offColor, onColor } from '../dynamic-vars.css';

export const track = style({
  border: 'none',
  backgroundColor: offColor,
});

export const checked = style([
  track,
  {
    backgroundColor: onColor,
  },
]);

export const checkedWithOutline = style({
  outline: `2px solid ${onColor}`,
  outlineOffset: '2px',
});
