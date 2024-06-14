import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const userSettingsPopoverNavLink = style({
  backgroundColor: vars.colors.named[5],

  ':hover': {
    backgroundColor: vars.colors.named[4],
  },
});
