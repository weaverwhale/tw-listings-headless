type GenericCallback<T> = (args: T) => any;

export type ObservableParams<T> = {
  initialData: T;
  /** If provided, allows you to extract computed value based on observed data. */
  get?(data: T): T;
  /** If provided, allows you to more accurately conditionally control how
   * data is set as well as provide side effects like saving in localStorage.
   * If function returns nothing, will be treated as side effect and the new
   * value in the callback will be the new value. If it returns something, that
   * returned value will be the new value.*/
  set?(newData: T, data: T): T | void;
};

export function isObservableParams(obj: unknown): obj is ObservableParams<any> {
  return !!(typeof obj === 'object' && obj && ('get' in obj || 'set' in obj));
}

export class Observable<T> {
  private _callbacks = new Set<GenericCallback<T>>();
  private _get: ObservableParams<T>['get'];
  private _set: ObservableParams<T>['set'];
  protected _data: T;

  public constructor({ initialData, get, set }: ObservableParams<T>) {
    this._data = initialData;
    if (get) this._get = get;
    if (set) this._set = set;
  }

  public get data(): T {
    return this._get ? this._get(this._data) : this._data;
  }

  public setData(newData: T): void {
    // use setter function if it exists
    newData = this._set?.(newData, this._data) ?? newData;

    // ignore if data is shallow equal
    if (newData === this._data) return;

    // set data
    this._data = newData;

    // finally emit to listeners
    this.emitUpdate();
  }

  public addUpdateListener = (callback: GenericCallback<T>): void => {
    this._callbacks.add(callback);
  };

  public removeUpdateListener = (callback: GenericCallback<T>): void => {
    this._callbacks.delete(callback);
  };

  protected emitUpdate = (): void => {
    this._callbacks.forEach((cb) => cb(this._data));
  };
}
