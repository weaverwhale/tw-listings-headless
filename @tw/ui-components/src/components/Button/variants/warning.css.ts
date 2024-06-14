import { createVar, style } from '@vanilla-extract/css';
import { base, lightDisabledVars } from './base.css';
import { vars } from '../../../theme';

const txtClr = createVar();
const filter = createVar();

const lightVars = {
  vars: {
    [txtClr]: vars.colors.yellow[4],
    [filter]: 'none',
  },
};

const darkVars = {
  vars: {
    [filter]: 'brightness(1.1)',
    [txtClr]: vars.colors.yellow[4],
  },
};

export const warning = style([
  base,
  {
    color: txtClr,
    borderColor: txtClr,

    selectors: {
      '&:not(:disabled):hover': {
        backgroundColor: vars.colors.yellow[0],
        color: txtClr,
        backdropFilter: filter,
      },
      '&:disabled': {
        ...lightDisabledVars,
        border: '1px solid',
        borderColor: vars.colors.yellow[2],
        backgroundColor: vars.colors.white,
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
