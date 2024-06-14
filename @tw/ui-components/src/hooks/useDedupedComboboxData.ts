import {
  ComboboxData,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxStringData,
  ComboboxStringItem,
} from '@mantine/core';
import { useMemo } from 'react';
import { Writeable } from '../utility-types';

const emptyArray: ComboboxData = [];

const isComboboxItemGroup = (x: unknown): x is ComboboxItemGroup<any> =>
  typeof x === 'object' && !!x && 'group' in x;

/**
 * Automatically removes all duplicates from combobox data
 * All values in ComboboxData - even nested values - must be competely unique
 * within the entire data set, meaning a nested value in a group can't share
 * the same value as some other item a level above.
 *
 * This recursive function automatically chooses the first value.  Therefore,
 * even if the value also exists in a group, the first value always takes
 * precedence.
 */
function dedupComboboxData<
  T extends ComboboxData | (string | ComboboxItem)[],
  R extends any[] = T extends (string | ComboboxItem)[]
    ? (string | ComboboxItem)[]
    : Writeable<ComboboxData>
>(data: T, tracker = new Set<string>()) {
  const newData = new Array<R[number]>();

  for (const d of data) {
    if (isComboboxItemGroup(d)) {
      const newGroup: ComboboxItemGroup = {
        group: d.group,
        items: dedupComboboxData(d.items, tracker),
      };
      newData.push(newGroup);
      continue;
    }

    const value = typeof d === 'string' ? d : d.value;
    if (tracker.has(value)) {
      console.warn('Found duplicate value in Combobox', value);
      continue;
    }
    tracker.add(value);
    newData.push(d);
  }

  return newData;
}

/** This hook uses `dedupComboboxData` under the hood to
 * make sure there are no duplicate values in the combobox. */
export function useDedupedComboboxData(data?: ComboboxData): ComboboxData {
  return useMemo(() => (!data ? emptyArray : dedupComboboxData(data)), [data]);
}

function dedupComboboxStringData<
  T extends ComboboxStringData | (string | ComboboxStringItem)[],
  R extends any[] = T extends (string | ComboboxStringItem)[]
    ? (string | ComboboxStringItem)[]
    : Writeable<ComboboxStringData>
>(data: T, tracker = new Set<string>()) {
  const newData = new Array<R[number]>();

  for (const d of data) {
    if (isComboboxItemGroup(d)) {
      const newGroup: ComboboxItemGroup<string | ComboboxStringItem> = {
        group: d.group,
        items: dedupComboboxStringData(d.items, tracker),
      };
      newData.push(newGroup);
      continue;
    }

    const value = typeof d === 'string' ? d : d.value;
    if (tracker.has(value)) {
      console.warn('Found duplicate value in Combobox', value);
      continue;
    }
    tracker.add(value);
    newData.push(d);
  }

  return newData;
}

/** This hook uses `dedupComboboxStringData` under the hood to
 * make sure there are no duplicate values in the combobox. */
export function useDedupedComboboxStringData(data?: ComboboxStringData): ComboboxStringData {
  return useMemo(() => (!data ? emptyArray : dedupComboboxStringData(data)), [data]);
}
