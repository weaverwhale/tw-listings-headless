import { FormattedColor } from '../../types';
import { MantineTheme } from '@mantine/core';
import { QuantityDecoratorProps } from './QuantityDecorator';
import { StyleComputer } from '../../classes/StyleComputer';

export class QuantityDecoratorComputer extends StyleComputer {
  private readonly size = 'sm'; // TODO: change to type Size when we have all sizes
  public readonly color: FormattedColor = 'one.6';
  // private readonly withBorder: boolean = true;

  // TODO: change to Size when we have all sizes
  private sizes: Readonly<Record<string, Record<'sm', `${string}rem`>>> = {
    dimension: {
      sm: '0.938rem',
    },
    font: {
      sm: '0.68rem',
    },
    border: {
      sm: '0.188rem',
    },
  };

  public constructor(
    public override readonly theme: MantineTheme,
    props: Pick<QuantityDecoratorProps, 'size' | 'color'>
  ) {
    super();
    this.size = props.size ?? this.size;
    this.color = props.color ?? this.color;
  }

  public get borderStyle() {
    return {
      borderWidth: this.sizes.border[this.size],
      borderColor: !this.darkMode ? this.theme.white : this.theme.colors.gray[8],
      borderStyle: 'solid',
    };
  }

  public get basicStyle() {
    return {
      fontFamily: this.theme.fontFamily,
    };
  }

  public get colorStyle() {
    return {
      backgroundColor: this.colorString,
      color: this.theme.white,
    };
  }

  public get sizeStyle() {
    return {
      width: this.sizes.dimension[this.size],
      height: this.sizes.dimension[this.size],
      fontSize: this.sizes.font[this.size],
    };
  }
}
