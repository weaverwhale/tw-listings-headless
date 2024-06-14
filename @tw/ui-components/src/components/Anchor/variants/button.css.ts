import { darken } from '@mantine/core';
import { style } from '@vanilla-extract/css';
import { anchorClr } from '../dynamic-vars.css';
import { base } from './base.css';
import { vars } from '../../../theme';

export const button = style([
  base,
  {
    ':disabled': {
      color: vars.colors.gray[3],
    },

    selectors: {
      '&:hover:not([data-disabled])': {
        color: darken(anchorClr, 0.075),
      },
    },
  },
]);
