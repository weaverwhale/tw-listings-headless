import { Title as MantineTitle, TitleProps as MantineTitleProps } from '@mantine/core';
import { PropsWithChildren, forwardRef } from 'react';
import { TwBaseProps } from '../../types';
import { useColorScheme } from '../../hooks';

export interface TitleProps extends TwBaseProps, PropsWithChildren, MantineTitleProps {
  weight?: MantineTitleProps['fw'];
  color?: MantineTitleProps['c'];
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => {
  const darkMode = useColorScheme().colorScheme === 'dark';
  const { c, color, ...rest } = props;
  const usedColor = c ?? color ?? (darkMode ? 'gray.1' : 'gray.6');
  return <MantineTitle {...rest} ref={ref} c={usedColor} />;
});
