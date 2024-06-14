import {
  createTheme,
  DefaultMantineColor,
  MantineColorsTuple,
  MantineThemeOverride,
  useMantineTheme,
} from '@mantine/core';
import { themeToVars } from '@mantine/vanilla-extract';
import { headings } from './constants/headings';
import { colors } from './constants/colors';

/**
 * @description This seems mostly safe to use in each component, since the theme
 * object doesn't really change and therefore won't cause rerenders.
 */
export const useTheme = useMantineTheme;

type ExtendedCustomColors = 'one' | 'two' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}

export const PRIMARY_SHADE = 5;

export const TRANSPARENT = '#00000000';
export const DEFAULT_RADIUS = 'sm';

export const theme: MantineThemeOverride = createTheme({
  scale: 1,
  fontSmoothing: true,
  white: '#fff',
  black: '#000',
  colors,
  primaryShade: PRIMARY_SHADE,
  primaryColor: 'one',
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  headings,
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    round: '2rem',
  },
  defaultRadius: 'sm',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem', // this is base
    lg: '1.125rem',
    xl: '1.25rem',
  },
  shadows: {
    sm: '0px 0.89px 1.78px 0px rgba(0, 0, 0, 0.06), 0px 0.8901px 2.67px 0px rgba(0, 0, 0, 0.10)',
  },
  respectReducedMotion: false,
  cursorType: 'pointer',
  other: {
    // TODO: See if this should be converted to `rem`
    spacing: {
      xxs: '4px',
      xs: '8px',
      sm: '12px',
      md: '16px',
      big: '20px',
      xbig: '24px',
      xxbig: '28px',
      xxxbig: '32px',
      lg: '40px',
      xl: '48px',
      xxl: '64px',
      xxxl: '80px',
      huge: '96px',
      xhuge: '128px',
      xxhuge: '160px',
      xxxhuge: '192px',
    },
  },
});

export const vars = themeToVars(theme);
