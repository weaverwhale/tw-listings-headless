import { createVar, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

export const shopImageOutlineClr = createVar();
export const shopImage = style({
  outline: `2px solid ${shopImageOutlineClr}`,
  outlineOffset: `1px`,
  border: `1px solid transparent`,

  vars: {
    [shopImageOutlineClr]: vars.colors.gray[4],
  },

  selectors: {
    [vars.darkSelector]: {
      [shopImageOutlineClr]: vars.colors.gray[2],
    },
  },
});

export const wrapper = style({
  height: '100vh',
  overflowY: 'scroll',
  '::-webkit-scrollbar': {
    display: 'none',
  },
});

export const dropZone = style({
  padding: '15px 20px 0',
  display: 'flex',
  justifyContent: 'flex-start',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  overflow: 'scroll',
  scrollbarWidth: 'none',
  cursor: 'pointer',
  maxHeight: '100vh',

  '::-webkit-scrollbar': {
    display: 'none',
  },
});
