import { MantineColorScheme, isMantineColorScheme } from '@mantine/core';
import { $store } from '@tw/snipestate';

/** Key where ui components color scheme is saved in local storage. */
export const LS_TW_UI_CLR_SCHEME_KEY = 'tw-ui-color-scheme';

const initVal = localStorage.getItem(LS_TW_UI_CLR_SCHEME_KEY);
/** Store used to control/observe the mantine color manager */
export const $colorScheme = $store<MantineColorScheme>(
  isMantineColorScheme(initVal) ? initVal : 'light'
);
