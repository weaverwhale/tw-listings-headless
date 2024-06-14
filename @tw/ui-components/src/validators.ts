import { colors } from './constants/colors';
import { FormattedColor, ShadelessColor } from './types';

export const isValidShadelessColor = (clr: string): clr is ShadelessColor => {
  return clr === 'white' || clr === 'black' || clr === 'transparent';
};

export const isValidFormattedColor = (clr: string): clr is FormattedColor => {
  if (isValidShadelessColor(clr)) return true;

  if (!clr.includes('.')) return false;

  const [name, shade] = clr.split('.');
  if (!(name in colors)) return false;

  const shadeNum = Number(shade);
  if (isNaN(shadeNum) || shadeNum < 0 || shadeNum > 9) return false;

  return true;
};
