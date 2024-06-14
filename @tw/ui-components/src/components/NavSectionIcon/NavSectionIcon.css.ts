import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { navIconH, navIconW } from './dynamic-vars.css';

export const navSectionIcon = style({
  borderRadius: vars.radius.sm,
  width: navIconW,
  height: navIconH,
  boxShadow: vars.shadows.sm,
  backgroundColor: vars.colors.one[0],

  selectors: {
    [vars.darkSelector]: {
      backgroundColor: vars.colors.gray[6],
    },
  },
});
