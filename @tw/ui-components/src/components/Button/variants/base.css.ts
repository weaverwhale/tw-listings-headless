import { style } from '@vanilla-extract/css';
import { buttonBgColor, buttonOutlineColor, disabledBgClr, disabledClr } from '../dynamic-vars.css';
import { vars } from '../../../theme';

export const lightDisabledVars = {
  vars: {
    [disabledBgClr]: vars.colors.gray[2],
    [disabledClr]: vars.colors.gray[4],
  },
};

export const darkDisabledVars = {
  vars: {
    [disabledBgClr]: vars.colors.gray[7],
    [disabledClr]: vars.colors.gray[5],
  },
};

export const base = style({
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  ':focus': {
    outline: `2px solid ${buttonOutlineColor}`,
    outlineOffset: '2px',
  },
  ':disabled': {
    backgroundColor: disabledBgClr,
    color: disabledClr,
    border: 'none',
  },
  ...lightDisabledVars,
  selectors: {
    '&:not(:disabled):hover': {
      backgroundColor: buttonBgColor,
      color: '#FFFFFF',
    },
    '&:disabled[data-clr-scheme="dark"]': darkDisabledVars,
    [vars.darkSelector + ':disabled:not([data-clr-scheme="light"])']: darkDisabledVars,
  },
});
