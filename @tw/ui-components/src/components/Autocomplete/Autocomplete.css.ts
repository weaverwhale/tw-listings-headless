import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const dropdown = style({
  backgroundColor: vars.colors.white,
  selectors: {
    [vars.darkSelector]: {
      backgroundColor: vars.colors.gray[7],
    },
  },
});

const optionHoverBg = createVar();
export const option = style({
  backgroundColor: vars.colors.white,
  color: vars.colors.gray[7],

  ':hover': {
    backgroundColor: optionHoverBg,
  },

  vars: {
    [optionHoverBg]: vars.colors.gray[2],
  },

  selectors: {
    [vars.darkSelector]: {
      backgroundColor: vars.colors.gray[7],
      color: vars.colors.gray[0],

      vars: {
        [optionHoverBg]: vars.colors.gray[8],
      },
    },
  },
});

const inputPlaceholderClr = createVar();
export const input = style({
  borderColor: vars.colors.gray[3],
  backgroundColor: vars.colors.white,
  color: vars.colors.gray[7],

  '::placeholder': {
    fontWeight: 500,
    color: inputPlaceholderClr,
  },

  vars: {
    [inputPlaceholderClr]: vars.colors.gray[7],
  },

  selectors: {
    [vars.darkSelector]: {
      borderColor: 'transparent',
      backgroundColor: vars.colors.gray[7],
      color: vars.colors.gray[0],

      vars: {
        [inputPlaceholderClr]: vars.colors.gray[0],
      },
    },
  },
});

export const inputWithError = style({
  position: 'relative',
  top: vars.spacing.xs,
});

export const error = style({
  position: 'relative',
  top: vars.spacing.xs,
  paddingTop: 5,
});

export const sectionWithError = style({
  paddingTop: vars.spacing.lg,
});
