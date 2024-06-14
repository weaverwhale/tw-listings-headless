import { CSSVariablesResolver } from '@mantine/core';
import { darkModeColors } from './constants/colors';

export const resolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-gray-0': darkModeColors.gray[0],
    '--mantine-color-gray-1': darkModeColors.gray[1],
    '--mantine-color-gray-2': darkModeColors.gray[2],
    '--mantine-color-gray-3': darkModeColors.gray[3],
    '--mantine-color-gray-4': darkModeColors.gray[4],
    '--mantine-color-gray-5': darkModeColors.gray[5],
    '--mantine-color-gray-6': darkModeColors.gray[6],
    '--mantine-color-gray-7': darkModeColors.gray[7],
    '--mantine-color-gray-8': darkModeColors.gray[8],
    '--mantine-color-gray-9': darkModeColors.gray[9],

    '--mantine-color-named-0': darkModeColors.named[0],
    '--mantine-color-named-1': darkModeColors.named[1],
    '--mantine-color-named-2': darkModeColors.named[2],
    '--mantine-color-named-3': darkModeColors.named[3],
    '--mantine-color-named-4': darkModeColors.named[4],
    '--mantine-color-named-5': darkModeColors.named[5],
    '--mantine-color-named-6': darkModeColors.named[6],
    '--mantine-color-named-7': darkModeColors.named[7],
    '--mantine-color-named-8': darkModeColors.named[8],
    '--mantine-color-named-9': darkModeColors.named[9],

    '--mantine-color-named2-0': darkModeColors.named2[0],
    '--mantine-color-named2-1': darkModeColors.named2[1],
    '--mantine-color-named2-2': darkModeColors.named2[2],
    '--mantine-color-named2-3': darkModeColors.named2[3],
    '--mantine-color-named2-4': darkModeColors.named2[4],
    '--mantine-color-named2-5': darkModeColors.named2[5],
    '--mantine-color-named2-6': darkModeColors.named2[6],
    '--mantine-color-named2-7': darkModeColors.named2[7],
    '--mantine-color-named2-8': darkModeColors.named2[8],
    '--mantine-color-named2-9': darkModeColors.named2[9],
  },
});
