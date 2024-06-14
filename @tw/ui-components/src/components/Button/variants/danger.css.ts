import { createVar, style } from '@vanilla-extract/css';
import { base, lightDisabledVars } from './base.css';
import { vars } from '../../../theme';

const txtClr = createVar();
const filter = createVar();

const lightVars = {
  vars: {
    [txtClr]: vars.colors.red[7],
    [filter]: 'none',
  },
};

const darkVars = {
  vars: {
    [filter]: 'brightness(1.1)',
    [txtClr]: vars.colors.red[7],
  },
};

export const danger = style([
  base,
  {
    color: txtClr,
    borderColor: txtClr,

    selectors: {
      '&:not(:disabled):hover': {
        backgroundColor: vars.colors.red[0],
        color: txtClr,
        backdropFilter: filter,
      },
      '&:disabled': {
        ...lightDisabledVars,
        border: '1px solid',
        borderColor: vars.colors.red[2],
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
