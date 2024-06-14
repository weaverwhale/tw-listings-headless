import { createVar, style } from '@vanilla-extract/css';
import { base } from './base.css';
import { vars } from '../../../theme';
import { disabledBgClr, disabledClr } from '../dynamic-vars.css';

const activatorBgColor = createVar();
const activatorButtonColor = createVar();
const activatorBorderClr = createVar();

const lightVars = {
  vars: {
    [activatorBgColor]: vars.colors.white,
    [activatorBorderClr]: vars.colors.gray[3],
    [activatorButtonColor]: vars.colors.gray[7],
    [disabledBgClr]: vars.colors.gray[1],
    [disabledClr]: vars.colors.gray[4],
  },
};

const darkVars = {
  vars: {
    [activatorBgColor]: vars.colors.gray[6],
    [activatorBorderClr]: vars.colors.gray[5],
    [activatorButtonColor]: vars.colors.gray[0],
    [disabledBgClr]: vars.colors.gray[7],
    [disabledClr]: vars.colors.gray[5],
  },
};

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

    selectors: {
      // making sure to override certain inherited styles...
      '&:hover:not(:disabled)': {
        color: activatorButtonColor,
        backgroundColor: activatorBgColor,
      },

      '&[data-clr-scheme="dark"]': darkVars,
      [vars.darkSelector + ':not([data-clr-scheme="light"])']: darkVars,
    },

    ...lightVars,
  },
]);
