import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const border = createVar();
const backgroundColor = createVar();
const color = createVar();

const disabledBg = createVar();
const disabledClr = createVar();

export const activeControl = style({
  ':active': {
    border,
    backgroundColor,
    color,
  },

  vars: {
    // [border]: `1px solid ${vars.colors.gray[2]}`,
    [backgroundColor]: vars.colors.white,
    [color]: vars.colors.gray[7],
    [disabledBg]: vars.colors.gray[1],
    [disabledClr]: vars.colors.gray[4],
  },

  selectors: {
    '&:active:disabled': {
      backgroundColor: disabledBg,
      color: disabledClr,
    },

    [vars.darkSelector]: {
      vars: {
        // [border]: 'none',
        [backgroundColor]: vars.colors.gray[7],
        [color]: vars.colors.gray[0],
        [disabledBg]: vars.colors.gray[8],
        [disabledClr]: vars.colors.gray[6],
      },
    },
  },
});
