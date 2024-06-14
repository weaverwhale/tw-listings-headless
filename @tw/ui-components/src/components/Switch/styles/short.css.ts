import { style } from '@vanilla-extract/css';
import { thumbSize, trackHeight, trackWidth } from '../dynamic-vars.css';
import { vars } from '../../../theme';

export const shortTrack = style({
  width: trackWidth,
  height: trackHeight,
  overflow: 'visible',
  minWidth: 'unset',
});

export const shortThumb = style({
  width: thumbSize,
  height: thumbSize,
  left: 0,
  border: `1px solid ${vars.colors.gray[2]} !important`,
});

export const shortThumbChecked = style([
  shortThumb,
  {
    left: `calc(100% - ${thumbSize}) !important`,
  },
]);
