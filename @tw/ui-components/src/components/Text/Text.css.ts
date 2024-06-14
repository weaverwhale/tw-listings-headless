import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const chosenColor = createVar();
export const text = style({ color: chosenColor });

export const defaultTextColor = createVar();
export const defaultText = style({
  color: defaultTextColor,

  vars: {
    [defaultTextColor]: vars.colors.gray[7],
  },

  selectors: {
    [vars.darkSelector]: {
      vars: {
        [defaultTextColor]: vars.colors.gray[0],
      },
    },
  },
});
