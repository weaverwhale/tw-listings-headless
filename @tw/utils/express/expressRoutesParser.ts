import { Express, Router } from 'express';
import { RouteMetaData, ExpressRegex, Key, Layer, Parameter, Route } from './types';

export function parseExpressApp(app: Express): RouteMetaData[] {
  return new ExpressPathParser(app).appPaths;
}

export function transformExpressPathToOpenApi(path: RouteMetaData): string {
  let result = path.path;
  path.pathParams.forEach((param: Parameter) => {
    result = result.replace(`:${param.name}`, `{${param.name}}`);
  });
  return result;
}

class ExpressPathParser {
  private readonly _appPaths: RouteMetaData[];
  public get appPaths() {
    return this._appPaths;
  }
  constructor(app: Express) {
    this._appPaths = [];
    const router: Router = app._router || app.router;
    if (router) {
      router.stack.forEach((layer: Layer) => {
        this.traverse('', layer, []);
      });
    }
  }
  private traverse = (path: string, layer: Layer, keys: Key[]): RouteMetaData | undefined => {
    keys = [...keys, ...layer.keys];
    if (layer.name === 'router' && layer.handle) {
      layer.handle.stack.forEach((l: Layer) => {
        path = path || '';
        this.traverse(`${path}/${pathRegexParser(layer.regexp, layer.keys)}`, l, keys);
      });
    }
    if (!layer.route || !layer.route.stack.length) {
      return;
    }
    this._appPaths.push(this.parseRouteLayer(layer, keys, path));
  };
  private parseRouteLayer = (layer: Layer, keys: Key[], basePath: string): RouteMetaData => {
    const lastRequestHandler = layer.route.stack[layer.route.stack.length - 1];
    // @ts-ignore
    lastRequestHandler.handle.allowAutoResponse = true;
    const pathParams: Parameter[] = keys.map((key) => {
      return { name: key.name, in: 'path', required: !key.optional };
    });
    const filtered = layer.route.stack.filter((element) => (element?.handle as Route)?.metadata);
    if (filtered.length > 1) {
      throw new Error('Only one metadata middleware is allowed per route');
    }
    const path = (basePath + layer.route.path).replace(/\/{2,}/gi, '/');
    if (filtered.length === 0) {
      return {
        path,
        pathParams,
        method: lastRequestHandler.method,
        handle: lastRequestHandler.handle,
      };
    }
    return {
      path,
      pathParams,
      method: lastRequestHandler.method,
      metadata: (filtered[0].handle as Route).metadata,
      handle: lastRequestHandler.handle,
    };
  };
}

const pathRegexParser = (layerRegexPath: ExpressRegex | string, keys: Key[]): string => {
  if (typeof layerRegexPath === 'string') {
    return layerRegexPath;
  }
  if (layerRegexPath.fast_slash) {
    return '';
  }
  if (layerRegexPath.fast_star) {
    return '*';
  }
  let mappedPath = '';
  if (keys && keys.length) {
    mappedPath = mapKeysToPath(layerRegexPath, keys);
  }
  const match = layerRegexPath
    .toString()
    .replace('\\/?', '')
    .replace('(?=\\/|$)', '$')
    .match(/^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//) as string[];

  if (match) {
    return match[1].replace(/\\(.)/g, '$1').slice(1);
  }
  if (mappedPath) {
    return mappedPath.slice(1);
  }
  return layerRegexPath.toString();
};

const mapKeysToPath = (layerRegexPath: ExpressRegex, keys: Key[]): string => {
  if (!keys || keys.length === 0) {
    throw Error('must include at least one key to map');
  }
  let convertedSubPath = layerRegexPath.toString();
  for (const key of keys) {
    if (key.optional) {
      convertedSubPath = convertedSubPath.replace('(?:\\/([^\\/]+?))?\\', `/:${key.name}?`);
    } else {
      convertedSubPath = convertedSubPath.replace('(?:([^\\/]+?))', `:${key.name}`);
    }
  }
  return convertedSubPath
    .replace('/?(?=\\/|$)/i', '')
    .replace('/^', '')
    .replace(/\\/gi, '')
    .replace(/\/{2,}/gi, '/');
};
