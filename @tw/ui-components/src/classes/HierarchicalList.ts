import { Observable } from '@tw/snipestate';
import { Prettify, WithPartial } from '../utility-types';

type Id = string & {};
type Depth = number & {};

export type HierarchicalListItem<T = any, M extends Record<string, any> = Record<string, any>> = {
  id: Id;
  value: T;
  depth?: Depth;
  children: HierarchicalListItem<T>[];
  metadata?: M;
};

export type FlatListItem<T = any, M extends Record<string, any> = Record<string, any>> = Prettify<
  Omit<HierarchicalListItem<T, M>, 'children'> & {
    parentId: string | null;
    index: number;
  }
>;

export type FlatList<T = any> = FlatListItem<T>[];

export type FlatListWithKeys<T = any> = Record<string, FlatListItem<T>>;

export class HierarchicalList<T> extends Observable<HierarchicalListItem<T>[]> {
  //
  // STATIC
  //
  private static addListItemDepth<T>(items: HierarchicalListItem<T>[], depth: number = 0) {
    for (const item of items) {
      item.depth = depth;
      this.addListItemDepth(item.children, depth + 1);
    }
    return items;
  }

  public static fromFlatList<T>(
    flatList: FlatList<T>,
    parentId: string | null = null
  ): HierarchicalListItem<T>[] {
    const { currentLevel, subLevel } = flatList.reduce(
      (acc, x) => (acc[x.parentId === parentId ? 'currentLevel' : 'subLevel'].push(x), acc),
      { currentLevel: [] as FlatList<T>, subLevel: [] as FlatList<T> }
    );

    return currentLevel.map(({ parentId, ...c }) => ({
      ...c,
      children: this.fromFlatList(subLevel, c.id),
    }));
  }

  public static toFlatList<T>(
    children: HierarchicalListItem<T>[],
    parent?: HierarchicalListItem<T>
  ): FlatList<T> {
    return children.reduce((acc, child, i) => {
      const { children, ..._child } = child;

      acc.push(
        { ..._child, parentId: parent?.id || null, index: i },
        ...this.toFlatList(children, child)
      );

      return acc;
    }, [] as FlatList<T>);
  }

  public static toFlatListWithKeys<T>(
    children: HierarchicalListItem<T>[],
    parent?: HierarchicalListItem<T>
  ): FlatListWithKeys<T> {
    return children.reduce((acc, child, i) => {
      const { children, ..._child } = child;

      acc[_child.id] = { ..._child, parentId: parent?.id || null, index: i };

      const subList = this.toFlatListWithKeys(children, child);
      for (const key in subList) {
        acc[key] = subList[key];
      }

      return acc;
    }, {} as FlatListWithKeys<T>);
  }

  public static fromFlatListWithKeys<T>(
    list: FlatListWithKeys<T>,
    parentId: string | null = null
  ): HierarchicalListItem<T>[] {
    const { currentLevel, subLevel } = Object.entries(list).reduce(
      (acc, [k, v]) => {
        const bucket = v.parentId === parentId ? 'currentLevel' : 'subLevel';

        if (bucket === 'subLevel') {
          acc.subLevel[k] = v;
          return acc;
        }

        const { parentId: _, index, ...rest } = v;
        const newItem = { ...rest, children: [] };

        // if there's a duplicate index, set dup after first
        if (acc.currentLevel[index]) {
          acc.currentLevel = [
            ...acc.currentLevel.slice(0, index),
            newItem,
            ...acc.currentLevel.slice(index),
          ];
        } else {
          acc.currentLevel[index] = newItem;
        }

        return acc;
      },
      {
        currentLevel: [] as HierarchicalListItem<T>[],
        subLevel: {} as FlatListWithKeys<T>,
      }
    );

    return currentLevel.map((c) => ({
      ...c,
      children: this.fromFlatListWithKeys(subLevel, c.id),
    }));
  }

  public static fromFlatListToFlatListWithKeys<T>(list: FlatList<T>) {
    const newList: FlatListWithKeys<T> = {};

    for (const item of list) {
      newList[item.id] = item;
    }

    return newList;
  }

  public static fromFlatListWithKeysToFlatLists<T>(list: FlatListWithKeys<T>) {
    const newList: FlatList<T> = [];

    for (const key in list) {
      const item = list[key];
      newList.push(item);
    }

    return newList;
  }

  //
  // BUILDERS
  //
  public static createHierarchicalListItem<T, M extends Record<string, any>>(
    params: WithPartial<HierarchicalListItem<T, M>, 'children' | 'metadata'>
  ): HierarchicalListItem<T, M> {
    if (!Array.isArray(params.children)) params.children = [];
    return params as HierarchicalListItem<T, M>;
  }

  public static createFlatListItem<T, M extends Record<string, any>>(
    params: WithPartial<FlatListItem<T, M>, 'parentId' | 'depth'>
  ): FlatListItem<T, M> {
    if (typeof params.parentId === 'undefined') params.parentId = null;
    return params as FlatListItem<T, M>;
  }

  public static getItemByTargetPath<T>(
    targetPath: number[],
    list: HierarchicalListItem<T>[]
  ): HierarchicalListItem<T> | undefined {
    let item: HierarchicalListItem<T>[] | HierarchicalListItem<T> = list;

    for (const target of targetPath) {
      item = item[target];
      if (!Array.isArray(item)) return item;
    }
  }

  //
  // INSTANCE
  //
  public constructor(items: HierarchicalListItem<T>[]) {
    super({ initialData: HierarchicalList.addListItemDepth(items) });
  }

  private cache = new Map<string, HierarchicalListItem<T>>();

  // emitting updates is taken care of separately here
  private set children(newList: HierarchicalListItem<T>[]) {
    this._data = newList;
  }

  private getItemById(
    itemId?: string | null,
    children: HierarchicalListItem<T>[] = this.children
  ): HierarchicalListItem<T> | undefined {
    if (!itemId) return;

    const cachedItem = this.cache.get(itemId);
    if (cachedItem) return cachedItem;

    for (const item of children) {
      if (item.id === itemId) return item;

      const foundItem = this.getItemById(itemId, item.children);
      if (foundItem) {
        this.cache.set(foundItem.id, foundItem);
        return foundItem;
      }
    }
  }

  public get asFlat() {
    return HierarchicalList.toFlatList(this.children);
  }

  public get children() {
    return this._data;
  }

  /**
   * @description Removes first item from top children by default.
   * if `itemId` is specified, finds children item with that id and removes
   * first item from that children
   */
  public shift({ itemId }: { itemId?: string }): HierarchicalListItem<T> | undefined {
    const item = this.getItemById(itemId);
    if (!item) return;

    const firstListItem = item.children.shift();
    if (!firstListItem) return;

    // no longer in children, so also no longer in cache
    this.cache.delete(firstListItem.id);

    item.children = [...item.children];

    this.emitUpdate();

    return firstListItem;
  }

  public unshift(args: { newItem: HierarchicalListItem<T>; itemId?: string }): number | undefined {
    const { newItem, itemId } = args;
    const item = this.getItemById(itemId);
    if (!item) return;

    const newItemWithDepth = { ...newItem, depth: (item.depth || 0) + 1 };
    item.children = [newItemWithDepth, ...item.children];

    // if added to array, also added to cache
    this.cache.set(newItem.id, newItem);

    this.emitUpdate();

    return item.children.length;
  }

  public push(args: { newItem: HierarchicalListItem<T>; itemId?: string }): number | undefined {
    const { newItem, itemId } = args;
    const item = this.getItemById(itemId);
    if (!item) return;

    const newItemWithDepth = { ...newItem, depth: (item.depth || 0) + 1 };
    item.children = [...item.children, newItemWithDepth];

    // if added to array, also added to cache
    this.cache.set(newItem.id, newItem);

    this.emitUpdate();

    return item.children.length;
  }

  public pop({ itemId }: { itemId?: string }) {
    const item = this.getItemById(itemId);
    if (!item) return;

    const lastItem = item.children.pop();
    if (!lastItem) return;

    // no longer in children, so also no longer in cache
    this.cache.delete(lastItem.id);

    item.children = [...item.children];

    this.emitUpdate();

    return lastItem;
  }

  public insert(args: { newItem: HierarchicalListItem<T>; index: number; itemId?: string }) {
    const { newItem, index, itemId } = args;
    const item = this.getItemById(itemId);
    if (!item) return;

    const newItemWithDepth = { ...newItem, depth: (item.depth || 0) + 1 };
    item.children = [
      ...item.children.slice(0, index),
      newItemWithDepth,
      ...item.children.slice(index),
    ];

    // if added to array, also added to cache
    this.cache.set(newItemWithDepth.id, newItemWithDepth);

    this.emitUpdate();

    return item.children.length;
  }

  public replace(args: {
    parentId?: string | null;
    newItem: HierarchicalListItem<T>;
    position: number;
  }) {
    const { parentId, newItem, position } = args;
    const parentItem = this.getItemById(parentId) || this;

    const newItemWithDepth = {
      ...newItem,
      depth: 'depth' in parentItem ? (parentItem.depth || 0) + 1 : 0,
    };
    parentItem.children = [
      ...parentItem.children.slice(0, position),
      newItemWithDepth,
      ...parentItem.children.slice(position + 1),
    ];

    // if added to array, also added to cache
    this.cache.set(newItemWithDepth.id, newItemWithDepth);

    this.emitUpdate();

    return parentItem.children.length;
  }

  public remove({ index, itemId }: { index: number; itemId?: string }) {
    const item = this.getItemById(itemId);
    if (!item) return;

    const [removedItem] = item.children.splice(index, 1);
    if (!removedItem) return;

    // no longer in children, so also no longer in cache
    this.cache.delete(removedItem.id);

    item.children = [...item.children];

    this.emitUpdate();

    return removedItem;
  }

  public reorder(args: {
    from: { key?: string; position: number };
    to: { key?: string; position: number };
  }) {
    const { from, to } = args;

    const source = this.getItemById(from.key) || this;
    const destination = this.getItemById(to.key) || this;

    const [removedItem] = source.children.splice(from.position, 1);
    if (!removedItem) return;

    destination.children = [
      ...destination.children.slice(0, to.position),
      removedItem,
      ...destination.children.slice(to.position),
    ];

    this.emitUpdate();
  }
}
