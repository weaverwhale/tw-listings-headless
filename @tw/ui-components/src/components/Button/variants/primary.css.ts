import { style } from '@vanilla-extract/css';
import { base } from './base.css';
import { buttonBgColor } from '../dynamic-vars.css';

export const primary = style([
  base,
  {
    backgroundColor: buttonBgColor,
  },
]);
