import { type AxiosError } from 'axios';

export function makePrettyAxiosError(error: AxiosError | any) {
  if (!error.response) {
    return error;
  }
  const { response } = error;
  const { data, status, statusText } = response;
  const pretty = new Error();
  pretty.message =
    typeof data === 'string'
      ? data
      : `${error.message} [${status} ${statusText}]: ${JSON.stringify(data, null, 2)}`;
  pretty.stack = error.stack;
  return pretty;
}
