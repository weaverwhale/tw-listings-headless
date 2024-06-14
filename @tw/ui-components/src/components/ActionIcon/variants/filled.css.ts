import { createVar, style } from '@vanilla-extract/css';
import { base } from './base.css';
import { vars } from '../../../theme';
import { disabledBgClr, disabledClr } from '../dynamic-vars.css';

const filledBgColor = createVar();
const filledButtonColor = createVar();
const hoverBgColor = createVar();
export const filled = style([
  base,
  {
    backgroundColor: filledBgColor,
    color: filledButtonColor,

    ':disabled': {
      backgroundColor: disabledBgClr,
      color: disabledClr,
    },

    // making sure to override certain inherited styles...
    ':hover': {
      backgroundColor: hoverBgColor,
    },

    vars: {
      [filledBgColor]: vars.colors.one[5],
      [filledButtonColor]: vars.colors.white,
      [hoverBgColor]: vars.colors.one[6],
      [disabledBgClr]: vars.colors.gray[1],
      [disabledClr]: vars.colors.gray[4],
    },

    selectors: {
      [vars.darkSelector]: {
        vars: {
          [filledBgColor]: vars.colors.one[5],
          [hoverBgColor]: vars.colors.one[6],
          [filledButtonColor]: vars.colors.white,
          [disabledBgClr]: vars.colors.gray[7],
          [disabledClr]: vars.colors.gray[5],
        },
      },
    },
  },
]);
