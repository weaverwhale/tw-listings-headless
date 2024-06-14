import { isPromise } from 'util/types';

export class Promiser {
  private _promises: Promise<any>[] = [];

  add(p: any) {
    this._promises.push(p);
    if (isPromise(p)) {
      // this will avoid a unawaited uncaught promise rejection
      p.catch((_e: any) => {});
    }
    return p;
  }

  all() {
    if (this._promises.length) {
      return Promise.all(this._promises);
    }
  }
}
