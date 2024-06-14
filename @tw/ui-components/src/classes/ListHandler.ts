import { Observable } from '@tw/snipestate';

export class ListHandler<T> extends Observable<T[]> {
  public constructor(list: T[]) {
    super({ initialData: list });
  }

  public get list() {
    return this._data;
  }

  private set list(newList: T[]) {
    this.setData(newList);
  }

  public shift() {
    const firstItem = this.list.shift();
    this.list = [...this.list];
    this.emitUpdate();
    return firstItem;
  }

  public unshift(newItem: T) {
    this.list = [newItem, ...this.list];
    this.emitUpdate();
  }

  public push(newItem: T) {
    this.list = [...this.list, newItem];
    this.emitUpdate();
  }

  public pop() {
    const lastItem = this.list[this.list.length - 1];
    this.list = this.list.slice(0, this.list.length - 1);
    this.emitUpdate();
    return lastItem;
  }

  public insert(newItem: T, index: number) {
    this.list = [...this.list.slice(0, index), newItem, ...this.list.slice(index)];
    this.emitUpdate();
  }

  public remove(index: number) {
    this.list.splice(index, 1);
    this.list = [...this.list];
    this.emitUpdate();
  }

  public reorder({ from, to }: { from: number; to: number }) {
    const [item] = this.list.splice(from, 1);
    this.list = [...this.list.slice(0, to), item, ...this.list.slice(to)];
    this.emitUpdate();
  }
}
