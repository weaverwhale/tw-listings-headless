import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { defaultTextColor } from '../Text/Text.css';

export const checkboxInput = style({
  selectors: {
    '&:not(:checked,[data-indeterminate],:disabled)': {
      borderColor: vars.colors.gray[4],
      backgroundColor: vars.colors.named[5],
    },
  },
});

export const label = style({
  color: defaultTextColor,
});
