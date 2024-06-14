/**
 * Contains uniform types for component library.
 */

import type { CSSProperties, ChangeEvent } from 'react';
import { colors } from './constants/colors';
import { NumRange, PickStartsWith } from './utility-types';
import { ensureKeysAreCSSProperties } from './utils';
import { icons } from './constants/icons';
import { GetStylesApiOptions, MantineStyleProps } from '@mantine/core';

export interface TwBaseProps {
  id?: string;
  'data-testid'?: string;
}

export interface TwPolymorphicComponent {
  as?: React.ElementType<any>;
}

/** Basic props to remove from each component - otherwise too much freedom */
export type MantinePropsToRemove =
  | keyof GetStylesApiOptions
  | keyof MantineStyleProps
  | 'vars' // we can't allow people to manipulate the vars directly
  | 'component'; // remove this too for polymorphic components - we use as (because we want to be in full control of the polymorphic behavior)

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 0;

// TODO: See if this is necessary
export type SpacingSize =
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'big'
  | 'xbig'
  | 'xxbig'
  | 'xxxbig'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'xxxl'
  | 'huge'
  | 'xhuge'
  | 'xxhuge'
  | 'xxxhuge';

// lightModeColors and darkModeColors always have the same number of keys, so using one is ok
export type ShadelessColor = 'white' | 'black' | 'transparent';
export type FormattedColor = ShadelessColor | `${keyof typeof colors}.${NumRange<0, 10>}`;

export type TwSpacingConfig = Record<SpacingSize, string>;

export type EventHandler<T extends React.HTMLAttributes<HTMLElement>> = PickStartsWith<
  T,
  `on${Capitalize<string>}`
>;

export type TWOnChange<T = any, E = HTMLInputElement> = (value: T, event: ChangeEvent<E>) => void;

/**
 * @description Hand picked props to allow controlled style flexibility that can be sent directly to Mantine.
 */
export interface TwStyleSystemProps {
  m?: Size | 'auto';
  my?: Size | 'auto';
  mx?: Size | 'auto';
  mt?: Size | 'auto';
  mb?: Size | 'auto';
  ml?: Size | 'auto';
  mr?: Size | 'auto';
  p?: Size;
  py?: Size;
  px?: Size;
  pt?: Size;
  pb?: Size;
  pl?: Size;
  pr?: Size;
  bg?: FormattedColor;
  c?: FormattedColor;
  opacity?: CSSProperties['opacity'];
  ff?: CSSProperties['fontFamily'];
  fz?: Size;
  fw?: CSSProperties['fontWeight'];
  lts?: CSSProperties['letterSpacing'];
  ta?: CSSProperties['textAlign'];
  lh?: CSSProperties['lineHeight'];
  fs?: CSSProperties['fontStyle'];
  tt?: CSSProperties['textTransform'];
  td?: CSSProperties['textDecoration'];
  w?: CSSProperties['width'];
  miw?: CSSProperties['minWidth'];
  maw?: CSSProperties['maxWidth'];
  h?: CSSProperties['height'];
  mih?: CSSProperties['minHeight'];
  mah?: CSSProperties['maxHeight'];
  bgsz?: CSSProperties['backgroundSize'];
  bgp?: CSSProperties['backgroundPosition'];
  bgr?: CSSProperties['backgroundRepeat'];
  bga?: CSSProperties['backgroundAttachment'];
  pos?: CSSProperties['position'];
  top?: CSSProperties['top'];
  left?: CSSProperties['left'];
  bottom?: CSSProperties['bottom'];
  right?: CSSProperties['right'];
  inset?: CSSProperties['inset'];
  display?: CSSProperties['display'];
}

/**
 * @description Size to boundary map for responsive things usually. Would prefer using Size here, TODO...
 */
export type BreakpointMap = Record<string, Readonly<[number, number?]>>;

/**
 * To create a new custom property, just add it here.  All components that use this const
 * either directly or through derived types will automatically get updated to being able to
 * use the added property.
 */
export const TwCustomStyleSystemFields = ensureKeysAreCSSProperties([
  'cursor',
  'border',
  'borderTop',
  'borderRight',
  'borderLeft',
  'borderBottom',
  'borderRadius',
  'overflow',
  'transform',
  'transition',
] as const);

// TODO: Figure out where to put the following few utils/constants/type guards
const TwCustomStyleSystemFieldsSet = new Set<keyof TwCustomStyleSystemProps>(
  TwCustomStyleSystemFields
);

export const isTwCustomStyleSystemField = (
  field: string
): field is keyof TwCustomStyleSystemProps => {
  // TODO: Find better solution for this
  return TwCustomStyleSystemFieldsSet.has(field as any);
};

/**
 * @description Custom style system props
 */
export type TwCustomStyleSystemProps = {
  [K in (typeof TwCustomStyleSystemFields)[number]]?: CSSProperties[K];
};

export type IconName = (typeof icons)[number];
