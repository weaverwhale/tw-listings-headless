import { createVar, style } from '@vanilla-extract/css';

export const drawerBg = createVar();
export const withScrollbar = createVar();

export const drawer = style({
  backgroundColor: drawerBg,
});

export const hiddenScroll = style({
  '::-webkit-scrollbar': {
    display: 'none',
  },
});
