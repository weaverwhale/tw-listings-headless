import { useEffect, useMemo, useState } from 'react';
import { HierarchicalList, HierarchicalListItem } from '../classes/HierarchicalList';

export function useHierarchicalList<T>(initialList: HierarchicalListItem<T>[]) {
  const [list, setList] = useState<HierarchicalListItem<T>[]>(initialList);
  const handler = useMemo(() => new HierarchicalList<T>(list), [list]);

  useEffect(() => {
    setList(initialList);
  }, [initialList]);

  useEffect(() => {
    const func = (l: HierarchicalListItem<T>[]) => setList([...l]);
    handler.addUpdateListener(func);
    return () => handler.removeUpdateListener(func);
  }, [handler]);

  return [list, handler] as const;
}
