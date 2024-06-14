import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const link = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 500,
  color: vars.colors.gray[7],

  selectors: {
    [vars.darkSelector]: {
      color: vars.colors.white,
    },
  },
});

const childLinkHvrClr = createVar();
export const childLink = style({
  padding: '3px 4px 3px 0px',
  borderRadius: 3,
  width: 210,

  vars: {
    [childLinkHvrClr]: vars.colors.gray[7],
  },

  ':hover': {
    color: childLinkHvrClr,
    backgroundColor: vars.colors.named[4],
  },

  selectors: {
    [vars.darkSelector]: {
      vars: {
        [childLinkHvrClr]: vars.colors.white,
      },
    },
  },
});

export const activeLink = style({
  color: vars.colors.gray[7],
  backgroundColor: vars.colors.named[4],

  selectors: {
    [vars.darkSelector]: {
      color: vars.colors.white,
    },
  },
});

export const sectionLink = style({
  padding: 8,
  paddingRight: 4,
  height: 40,

  ':hover': {
    backgroundColor: vars.colors.named[2],
  },
});
