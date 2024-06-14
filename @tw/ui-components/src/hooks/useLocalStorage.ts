import { useEffect, useMemo, useState } from 'react';

type NotFunction<T> = T extends Function ? never : T;
type LocalStorageStateSetter<T extends NotFunction<{}>> = (
  value: T | ((prevState: T) => T)
) => void;

export function useLocalStorage<T extends {} | any[]>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: T;
}): [T, LocalStorageStateSetter<T>] {
  const storedState = useMemo(() => localStorage.getItem(key) || '""', [key]);
  const [state, setState] = useState<T>(JSON.parse(storedState) || defaultValue);

  const setLocalStorageState: LocalStorageStateSetter<T> = (value) => {
    const computedVal = typeof value === 'function' ? value(state) : value;
    setState(computedVal);
    const valStr = JSON.stringify(computedVal);
    localStorage.setItem(key, valStr);
  };

  useEffect(() => {
    setLocalStorageState(state);
  }, []);

  return [state, setLocalStorageState];
}
