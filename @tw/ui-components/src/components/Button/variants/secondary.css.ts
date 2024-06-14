import { style } from '@vanilla-extract/css';
import { base } from './base.css';
import { vars } from '../../../theme';
import { buttonOutlineColor } from '../dynamic-vars.css';

export const secondary = style([
  base,
  {
    color: buttonOutlineColor,
    borderColor: buttonOutlineColor,
    selectors: {
      '&:not(:disabled):hover': {
        color: vars.colors.white,
      },
    },
  },
]);
