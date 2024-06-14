import { style } from '@vanilla-extract/css';

export const hiddenScrollbar = style({
  '::-webkit-scrollbar': {
    display: 'none',
  },
});
