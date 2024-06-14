import { style } from '@vanilla-extract/css';
import { base } from './base.css';

export const gradient = style([
  base,
  {
    ':focus': {
      outline: 'none',
    },
  },
]);
