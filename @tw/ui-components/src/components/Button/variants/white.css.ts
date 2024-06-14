import { createVar, style } from '@vanilla-extract/css';
import { base, lightDisabledVars } from './base.css';
import { vars } from '../../../theme';
import { disabledBgClr } from '../dynamic-vars.css';

const txtClr = createVar();
const filter = createVar();

const lightVars = {
  vars: {
    [txtClr]: vars.colors.gray[7],
    [filter]: 'none',
  },
};

const darkVars = {
  vars: {
    [filter]: 'brightness(1.1)',
    [txtClr]: vars.colors.gray[0],
  },
};

export const white = style([
  base,
  {
    backgroundColor: vars.colors.white,
    color: txtClr,

    selectors: {
      '&:not(:disabled):hover': {
        backgroundColor: vars.colors.gray[0],
        color: txtClr,
        backdropFilter: filter,
      },
      '&:disabled': {
        ...lightDisabledVars,
        backgroundColor: lightDisabledVars.vars[disabledBgClr],
      },
      '&[data-clr-scheme="dark"]': darkVars,
      [vars.darkSelector + ':not(:disabled, [data-clr-scheme="light"])']: {
        ...darkVars,
        backgroundColor: 'inherit',
      },
    },

    ...lightVars,
  },
]);
