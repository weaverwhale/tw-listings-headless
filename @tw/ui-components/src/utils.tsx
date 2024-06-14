import {
  FormattedColor,
  IconName,
  TwCustomStyleSystemProps,
  isTwCustomStyleSystemField,
} from './types';
import { isValidShadelessColor } from './validators';
import { Icon, IconProps } from './components';
import { PRIMARY_SHADE, TRANSPARENT, vars } from './theme';

export function isDefined<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

/**
 * @description Extracts the valid CSS color corresponding to the FormattedColor provided based on the dynamic colors.
 * If no shade is provided, uses theme defined primary shade which should be 6.
 */
export function extractCSSColor(clr: FormattedColor): string {
  if (isValidShadelessColor(clr)) {
    if (clr === 'transparent') return TRANSPARENT;
    return vars.colors[clr];
  }

  const [color, shade] = clr.split('.');

  if (isNaN(+shade) || +shade > 9 || +shade < 0) {
    return vars.colors[color]?.[PRIMARY_SHADE];
  }

  return vars.colors[color]?.[+shade as keyof (typeof vars.colors)[typeof color]];
}

export function ensureKeysAreCSSProperties<T extends keyof React.CSSProperties>(
  keys: ReadonlyArray<T>
) {
  return keys;
}

type CustomStyleAndRestProps<T extends object> = {
  style: React.CSSProperties;
  rest: Omit<T, keyof TwCustomStyleSystemProps>;
};

/**
 * @description Generally we try using overridden default mantine style props when trying to expose certain flexibility
 * for more custom styling, but in cases where some properties don't just exist in Mantine's style system, and we have
 * to add the styles ourselves, this function can come in handy.
 */
export function extractAndMapCustomPropsToStyle<T extends object>(
  props: T
): CustomStyleAndRestProps<T> {
  const result: CustomStyleAndRestProps<T> = {
    style: {},
    rest: {} as Omit<T, keyof TwCustomStyleSystemProps>,
  };

  for (const key in props) {
    if (isTwCustomStyleSystemField(key)) {
      result.style[key] = String(props[key]);
      continue;
    }
    // TODO: Find a better solution for this
    (result.rest as any)[key] = props[key];
  }

  return result;
}

/**
 * @description Can be used to always return an Icon element or null whether input is Icon or icon name
 */
export function extractIcon(
  icon?: JSX.Element | IconName | null,
  iconProps?: Omit<IconProps, 'name'>
) {
  if (!icon) return null;
  if (typeof icon !== 'string') return icon;
  return <Icon name={icon as IconName} {...iconProps} />;
}
