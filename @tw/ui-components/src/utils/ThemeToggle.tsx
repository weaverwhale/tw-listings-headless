/**
 * @fileoverview This component isn't meant for external use.
 */

import { $colorScheme } from '../stores';
import { Switch } from '../components';

export const ThemeToggle = () => {
  const [colorScheme, setColorScheme] = $colorScheme.useStore();

  return (
    <Switch
      checked={colorScheme === 'dark'}
      onColor="orange.4"
      offColor="gray.3"
      onChange={() => setColorScheme((p) => (p === 'light' ? 'dark' : 'light'))}
    />
  );
};
