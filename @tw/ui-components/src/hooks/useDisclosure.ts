import { useCallback, useState } from 'react';

export function useDisclosure(initialValue: boolean) {
  const [opened, setOpened] = useState(initialValue);

  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => setOpened((x) => !x), []);

  return [opened, { open, close, toggle }] as const;
}
