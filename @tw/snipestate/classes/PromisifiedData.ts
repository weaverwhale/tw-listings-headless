export class PromisifiedData<T = any> {
  public data?: T;
  public pending: boolean = true;
  public error?: unknown;

  public constructor(args?: { data?: T; pending?: boolean; error?: unknown }) {
    if (args) {
      this.data = args.data;
      this.pending = args.pending ?? this.pending;
      this.error = args.error;
    }
  }
}
