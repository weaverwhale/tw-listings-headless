import { style } from '@vanilla-extract/css';
import { actionIconClr, borderRadius } from '../dynamic-vars.css';

export const base = style({
  borderRadius,
  transform: 'scale(1.05)',

  ':active': {
    transform: 'scale(1.05) translateY(calc(0.0625rem*var(--mantine-scale)))',
  },
});

export const focusOutline = style([
  base,
  {
    ':focus': {
      boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.05),
              0px 0px 0px 2px #FFFFFF,
              0px 0px 0px 4px ${actionIconClr}`,
    },
  },
]);
