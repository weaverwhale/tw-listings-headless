import { useMemo } from 'react';
import { FormattedColor } from '../types';
import { extractCSSColor } from '../utils';

type HexColor = string;

export function useParsedColor(clr: FormattedColor | 'inherit'): HexColor {
  return useMemo(() => (clr === 'inherit' ? 'inherit' : extractCSSColor(clr)), [clr]);
}
