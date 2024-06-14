import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const skeletonBeforeColor = createVar();
export const skeletonAfterColor = createVar();

export const skeleton = style({
  vars: {
    [skeletonBeforeColor]: vars.colors.gray[2],
    [skeletonAfterColor]: vars.colors.gray[3],
  },

  selectors: {
    '&[data-visible]::before': {
      backgroundColor: skeletonBeforeColor + ' !important',
    },

    '&[data-visible]::after': {
      backgroundColor: skeletonAfterColor + ' !important',
    },

    [vars.darkSelector]: {
      vars: {
        [skeletonBeforeColor]: vars.colors.gray[4],
        [skeletonAfterColor]: vars.colors.gray[5],
      },
    },
  },
});
