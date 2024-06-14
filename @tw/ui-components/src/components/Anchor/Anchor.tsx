import { Anchor as MantineAnchor } from '@mantine/core';
import { PropsWithChildren, forwardRef, useMemo } from 'react';
import {
  EventHandler,
  FormattedColor,
  IconName,
  MantinePropsToRemove,
  TwBaseProps,
  TwPolymorphicComponent,
  TwStyleSystemProps,
} from '../../types';
import { vars } from '../../theme';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { anchorClr } from './dynamic-vars.css';
import { PropsFrom } from '../../utility-types';
import { useParsedColor } from '../../hooks';
import { Text, TextProps } from '../Text/Text';
import * as classes from './variants';
import { extractIcon } from '../../utils';

interface BaseAnchorProps
  extends TwBaseProps,
    TwStyleSystemProps,
    PropsWithChildren,
    TwPolymorphicComponent,
    Omit<EventHandler<React.AnchorHTMLAttributes<HTMLAnchorElement>>, 'onClick'>,
    Omit<PropsFrom<typeof MantineAnchor>, MantinePropsToRemove> {
  color?: FormattedColor;
  textProps?: TextProps;
}

export interface AnchorDefaultProps
  extends BaseAnchorProps,
    Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target'> {
  as?: 'a';
}

export interface AnchorButtonProps extends BaseAnchorProps {
  as: 'button';
  onClick?: () => any;
  disabled?: boolean;
  leftIcon?: JSX.Element | IconName | null;
  rightIcon?: JSX.Element | IconName | null;
}

export type AnchorProps = AnchorDefaultProps | AnchorButtonProps;

const getButtonProps = (props: AnchorButtonProps) => {
  // extract props specifically to do with AnchorButton
  const {
    leftIcon,
    rightIcon,
    disabled,
    onClick: _onClick,
    children: _children,
    textProps,
    ...rest
  } = props;
  // get text props
  const { lineClamp, inline, underline, color, c } = rest;
  const onClick = disabled ? () => false : _onClick;

  const children = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: vars.spacing.xs,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {!!leftIcon && extractIcon(leftIcon)}
      <Text {...{ color, c, lineClamp, inline, underline, ...textProps }}>{_children}</Text>
      {!!rightIcon && extractIcon(rightIcon)}
    </div>
  );

  return {
    ...rest, // rest shouldn't contain non-html attributes now
    onClick,
    children,
  };
};

const getDefaultProps = ({ textProps, ...props }: AnchorDefaultProps) => {
  return { ...textProps, ...props };
};

export const Anchor = forwardRef<any, AnchorProps>((props, ref) => {
  const computedProps = useMemo(
    () => (props.as === 'button' ? getButtonProps(props) : getDefaultProps(props)),
    [props]
  );
  const parsedColor = useParsedColor(props.color || props.c || 'one.6');

  return (
    <MantineAnchor
      ref={ref}
      {...computedProps}
      style={assignInlineVars({ [anchorClr]: parsedColor })}
      className={classes.base}
    />
  );
});
