import { PropsWithChildren } from 'react';
import { MantineColorScheme, MantineColorSchemeManager, MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { resolver } from './css-variable-resolver';
import { $colorScheme, LS_TW_UI_CLR_SCHEME_KEY } from '.';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={colorSchemeManager}
      cssVariablesResolver={resolver}
    >
      {children}
    </MantineProvider>
  );
};

/**
 * This color scheme manager is controlled by $colorScheme store.
 * All TW devs should use the store - this manager is for Mantine to use internally.
 */
const colorSchemeManager: MantineColorSchemeManager = (() => {
  $colorScheme.subscribe((newVal) => localStorage.setItem(LS_TW_UI_CLR_SCHEME_KEY, newVal));

  let unsub = () => {};

  return {
    get: $colorScheme.get,
    set: $colorScheme.set,
    subscribe: (cb: (newVal: MantineColorScheme) => void) => {
      unsub = $colorScheme.subscribe(cb);
    },
    unsubscribe: () => unsub(),
    clear: () => {},
  };
})();
