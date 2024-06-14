export class HttpErrorResponse extends Error {
  constructor(error, public status) {
    super(error.message);
  }
}
