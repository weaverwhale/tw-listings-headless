import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const hover = style({
  ':hover': {
    backgroundColor: vars.colors.named[4],
  },
  ':first-of-type': {
    borderTopRightRadius: vars.radius.sm,
    borderTopLeftRadius: vars.radius.sm,
  },
  ':last-of-type': {
    borderBottomRightRadius: vars.radius.sm,
    borderBottomLeftRadius: vars.radius.sm,
  },
});
