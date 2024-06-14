import { style } from '@vanilla-extract/css';
import { anchorClr } from '../dynamic-vars.css';
import { vars } from '../../../theme';
import { darken } from '@mantine/core';

export const base = style({
  color: anchorClr,

  ':disabled': {
    color: vars.colors.gray[3],
  },

  ':hover': {
    color: darken(anchorClr, 0.075) + ' !important',
  },

  vars: {
    [anchorClr]: vars.colors.one[6],
  },

  selectors: {
    [vars.darkSelector]: {
      vars: {
        [anchorClr]: vars.colors.one[5],
      },
    },
  },
});
