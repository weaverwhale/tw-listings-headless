import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { fontWeight, borderColor, minDropdownWidth } from './dynamic-vars.css';
import { darken } from '@mantine/core';

export const dropdown = style({
  borderColor,
  backgroundColor: vars.colors.white,
  minWidth: minDropdownWidth,

  selectors: {
    [vars.darkSelector]: {
      backgroundColor: vars.colors.gray[6],
    },
  },
});

export const input = style({
  borderColor,
  color: vars.colors.black,
  fontWeight,
  backgroundColor: vars.colors.white,

  selectors: {
    [vars.darkSelector]: {
      color: vars.colors.white,
      backgroundColor: vars.colors.gray[6],
    },
  },
});

export const inputFocus = style({
  ':focus': {
    borderColor,
  },
});

const optionClr = createVar();
export const option = style({
  fontWeight,
  color: optionClr,
  backgroundColor: vars.colors.white,

  vars: {
    [optionClr]: vars.colors.black,
  },

  selectors: {
    [vars.darkSelector]: {
      backgroundColor: vars.colors.gray[6],

      vars: {
        [optionClr]: vars.colors.white,
      },
    },

    '&:hover, &[data-selected="true"]': {
      backgroundColor: vars.colors.named[4],
    },

    '&[data-selected="true"]:hover': {
      backgroundColor: darken(vars.colors.named[4], 0.1),
    },
  },
});

export const section = style({
  // TODO: Figure out why this is necessary - somehow the section blocks the click event...
  pointerEvents: 'none',
});
