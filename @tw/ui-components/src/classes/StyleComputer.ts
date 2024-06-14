import { MantineTheme } from '@mantine/core';
import { FormattedColor } from '../types';
import { isValidShadelessColor } from '../validators';
import { $colorScheme } from '../stores';
import { TRANSPARENT, vars } from '../theme';

export abstract class StyleComputer {
  public abstract readonly color: FormattedColor;
  public abstract readonly theme: MantineTheme;

  protected get darkMode(): boolean {
    return $colorScheme.get() === 'dark';
  }

  public get colorString(): string {
    if (isValidShadelessColor(this.color)) {
      if (this.color === 'transparent') return TRANSPARENT;
      return vars.colors[this.color];
    }

    const [color, shade] = this.color.split('.');

    //@ts-ignore
    return vars.colors[color][Number(shade)];
  }
}
