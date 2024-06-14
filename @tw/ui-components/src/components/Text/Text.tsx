import { PropsWithChildren, forwardRef, useMemo } from 'react';
import { GetStylesApiOptions, Text as MantineText } from '@mantine/core';
import { FormattedColor, TwBaseProps, TwPolymorphicComponent } from '../../types';
import { PropsFrom, extractCSSColor } from '../..';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { chosenColor, defaultText, text } from './Text.css';

type MantineTextProps = PropsFrom<typeof MantineText>;

export interface TextProps
  extends TwBaseProps,
    TwPolymorphicComponent,
    PropsWithChildren,
    Omit<MantineTextProps, keyof GetStylesApiOptions | 'c'> {
  c?: FormattedColor;
  color?: FormattedColor;
  as?: MantineTextProps['component'];
  weight?: MantineTextProps['fw'];
  align?: MantineTextProps['ta'];
}

export const Text = forwardRef<HTMLElement, TextProps>((props, ref) => {
  const { as = 'div', span, c, color, weight, align, ...rest } = props;

  const dynamicColor = useMemo(() => {
    const receivedColor = color || c;
    return receivedColor ? extractCSSColor(receivedColor) : undefined;
  }, [color, c]);

  return (
    <MantineText
      {...rest}
      style={assignInlineVars({ [chosenColor]: dynamicColor })}
      className={color || c ? text : defaultText}
      fw={rest.fw ?? weight}
      ta={rest.ta ?? align}
      component={span ? 'span' : as}
      ref={ref}
      data-tw-ui-component="Text"
    />
  );
});
