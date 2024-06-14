import { createVar, style } from '@vanilla-extract/css';
import { PRIMARY_SHADE, vars } from '../../theme';

export const inputClr = createVar();
export const inputBgClr = createVar();
export const input = style({
  backgroundColor: inputBgClr,
  borderColor: 'transparent',
  color: inputClr,

  '::placeholder': {
    color: vars.colors.named[7],
  },
});

export const inputWithError = style({
  position: 'relative',
  top: vars.spacing.xs,
});

export const inputWithBorder = style({
  borderColor: vars.colors.named2[3],

  ':focus': {
    borderColor: vars.colors.one[PRIMARY_SHADE],
  },
});

export const errorStyle = style({
  position: 'relative',
  top: vars.spacing.xs,
  paddingTop: 5,
});
