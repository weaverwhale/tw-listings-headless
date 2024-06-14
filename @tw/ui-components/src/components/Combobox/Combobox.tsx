// import { PropsWithChildren } from 'react';
import { Combobox as MantineCombobox } from '@mantine/core';
// import { MantinePropsToRemove, TwBaseProps } from '../../types';
import { PropsFrom } from '../../utility-types';
// import { getMarketingProps } from '../../utils/commonPropGenerators';

// export interface ComboboxProps
//   extends TwBaseProps,
//     PropsWithChildren,
//     Omit<MantineComboboxProps, MantinePropsToRemove> {}

export interface ComboboxProps extends PropsFrom<typeof MantineCombobox> {}

export const Combobox = MantineCombobox;
