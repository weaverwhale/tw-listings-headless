export class BaseApiResponse<D, A extends Record<string, any> = any> {
  data: D;
  attributes?: A;
}
