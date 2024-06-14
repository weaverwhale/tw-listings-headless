import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const styledNavLink = style({
  backgroundColor: vars.colors.named[5],
});

export const styledNavLinkHover = style({
  ':hover': {
    backgroundColor: vars.colors.named[4],
  },
});

const navLinkTopBorder = createVar();
export const styledNavLinkBorder = style({
  borderTop: navLinkTopBorder,

  vars: {
    [navLinkTopBorder]: `1px solid white`,
  },

  selectors: {
    [vars.darkSelector]: {
      [navLinkTopBorder]: `1px solid #262D3B`,
    },
  },
});
