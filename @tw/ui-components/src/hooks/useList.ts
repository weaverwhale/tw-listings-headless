import { useEffect, useMemo, useState } from 'react';
import { ListHandler } from '../classes/ListHandler';

/** Utility hook that just makes it a bit easier to deal with list states in an optimized way */
export function useList<T>(initialList: T[]) {
  const [list, setList] = useState<T[]>(initialList);
  const handler = useMemo(() => new ListHandler<T>(list), [list]);

  useEffect(() => {
    handler.addUpdateListener(setList);
    return () => handler.removeUpdateListener(setList);
  }, [handler]);

  return [list, handler] as const;
}
