import { createVar, style } from '@vanilla-extract/css';
import { base } from './base.css';
import { vars } from '../../../theme';
import { disabledBgClr, disabledClr } from '../dynamic-vars.css';

const activatorBgColor = createVar();
const activatorButtonColor = createVar();
const activatorBorderClr = createVar();
export const activator = style([
  base,
  {
    backgroundColor: activatorBgColor,
    color: activatorButtonColor,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: activatorBorderClr,

    ':focus': {
      outline: 'none',
    },

    ':disabled': {
      backgroundColor: disabledBgClr,
      color: disabledClr,
    },

    // making sure to override certain inherited styles...
    ':hover': {
      backgroundColor: activatorBgColor,
    },

    vars: {
      [activatorBgColor]: vars.colors.white,
      [activatorBorderClr]: vars.colors.named2[3],
      [activatorButtonColor]: vars.colors.gray[7],
      [disabledBgClr]: vars.colors.gray[1],
      [disabledClr]: vars.colors.gray[4],
    },

    selectors: {
      [vars.darkSelector]: {
        vars: {
          [activatorBgColor]: vars.colors.gray[6],
          [activatorBorderClr]: vars.colors.named2[3],
          [activatorButtonColor]: vars.colors.gray[0],
          [disabledBgClr]: vars.colors.gray[7],
          [disabledClr]: vars.colors.gray[5],
        },
      },
    },
  },
]);
