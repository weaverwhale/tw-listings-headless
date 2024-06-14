import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const placeholder = style({
  ':hover': {
    backgroundColor: vars.colors.one[5],
  },
});
