import { vars } from '../../theme';
import { StyleComputer } from '../../classes/StyleComputer';
import { FormattedColor, Size } from '../../types';
import { SwitchProps, SwitchVariants } from './Switch';
import { MantineTheme } from '@mantine/core';
import { extractCSSColor } from '../..';

type ExtractedSwitchProps = Pick<
  SwitchProps,
  'size' | 'color' | 'onColor' | 'offColor' | 'variant' | 'checked'
>;

export class SwitchStyleComputer extends StyleComputer {
  private readonly size: Exclude<Size, 0> = 'md';
  private readonly variant: SwitchVariants = 'simple';
  private readonly checked: boolean = false;
  public override readonly color: FormattedColor = 'one.6';
  private readonly onColor: string;
  private readonly offColor: string;

  public constructor(public override readonly theme: MantineTheme, props: ExtractedSwitchProps) {
    super();
    this.size = props.size ?? this.size;
    this.color = props.color ?? this.color;

    const extractedColor = extractCSSColor(this.color);
    this.onColor = props.onColor ? extractCSSColor(props.onColor) : extractedColor;
    this.offColor = props.offColor ? extractCSSColor(props.offColor) : extractedColor;

    this.variant = props.variant ?? this.variant;
    this.checked = props.checked ?? this.checked;
  }

  private get shortTrack(): object | null {
    if (this.variant !== 'short') return null;
    const trackSize = {
      xs: { width: '1.125rem', height: '0.5rem' },
      sm: { width: '1.75rem', height: '0.75rem' },
      md: { width: '2.25rem', height: '1rem' },
      lg: { width: '2.875rem', height: '1.25rem' },
      xl: { width: '3.375rem', height: '1.5rem' },
    }[this.size];
    return {
      ...trackSize,
      overflow: 'visible',
      minWidth: 'unset',
    };
  }

  private get shortThumb(): object | null {
    if (this.variant !== 'short') return null;

    const thumbSize = {
      xs: '0.625rem',
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
      xl: '1.875rem',
    }[this.size];

    return {
      width: thumbSize,
      height: thumbSize,
      left: this.checked ? `calc(100% - ${thumbSize}) !important` : 0,
      border: `1px solid ${vars.colors.gray[2]} !important`,
    };
  }

  private get checkedStyles() {
    return {
      backgroundColor: this.offColor,
      boxShadow: `0px 0px 0px 2px #FFFFFF, 0px 0px 0px 4px ${this.offColor}`,
    };
  }

  // currently using the format for Mantine custom styles based on their style api for the switch component
  public get track_CustomStyles() {
    return {
      border: 'none',
      backgroundColor: this.onColor,
      ...(!!this.checked && this.checkedStyles),
      ...(!!this.shortTrack && this.shortTrack),
    };
  }

  public get thumb_CustomStyles() {
    return {
      border: 'none',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      ...(!!this.shortThumb && this.shortThumb),
    };
  }
}
