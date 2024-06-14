import { FC } from 'react';
import {
  Grid as MantineGrid,
  GridProps as MantineGridProps,
  GridColProps as MantineColProps,
} from '@mantine/core';
import { MantinePropsToRemove, Size, TwBaseProps, TwStyleSystemProps } from '../../types';
import { PropsFrom } from '../../utility-types';

export interface GridProps
  extends TwBaseProps,
    TwStyleSystemProps,
    Omit<MantineGridProps, MantinePropsToRemove> {
  gutter?: Size;
  gutterLg?: Size;
  gutterMd?: Size;
  gutterSm?: Size;
  gutterXl?: Size;
  gutterXs?: Size;
}

// TODO: See what to omit from here
interface IGridCol extends MantineColProps {}

interface IGrid extends FC<GridProps> {
  Col: FC<PropsFrom<typeof MantineGrid.Col> & IGridCol>;
}

export const Grid: IGrid = (props) => {
  return <MantineGrid {...props} />;
};

Grid.Col = (props: IGridCol) => {
  return <MantineGrid.Col {...props} />;
};
