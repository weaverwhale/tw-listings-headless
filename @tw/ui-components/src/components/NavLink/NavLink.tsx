import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps, FormattedColor, TwPolymorphicComponent } from '../../types';
import {
  GetStylesApiOptions,
  NavLink as MantineNavLink,
  NavLinkProps as MantineNavLinkProps,
} from '@mantine/core';

// TODO: Need to fix spacing, so we don't allow number offset here
export interface NavLinkProps
  extends TwBaseProps,
    PropsWithChildren,
    TwPolymorphicComponent,
    // TODO: Double check if we shouldn't allow everything here
    // Omit<EventHandler<React.ButtonHTMLAttributes<HTMLButtonElement>>, 'onChange'>,
    Omit<MantineNavLinkProps, keyof GetStylesApiOptions> {
  color?: FormattedColor;
  as?: 'a';
  onClick?: () => void;
}

export const NavLink = forwardRef<any, NavLinkProps>((props, ref) => {
  const mappedProps = {
    ...props,
    ...(props.as && { component: props.as }),
  };

  return <MantineNavLink {...mappedProps} ref={ref} />;
});
