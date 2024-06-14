import yaml from 'yaml';
import * as fs from 'fs';
import { isLocal } from '@tw/constants';
import { removeServiceIdFromPath } from '../express/utils';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { RouteMetaData } from '../express/types';
import { transformExpressPathToOpenApi } from '../express/expressRoutesParser';
import {
  addRateLimits,
  baseOpenApiDoc,
  defaultOpenApiOperation,
  getAlternativePath,
} from './utils';
import { ApiConfigArgs, TwOperationObject } from '../express';
import { ISchemaConverters } from 'class-validator-jsonschema/build/defaultConverters';

const openApiFilePath = './openapi.yml';

let extraPaths: Record<string, Record<string, TwOperationObject>> = {};

export function exportOpenApiFromNestJs(document) {
  if (!isLocal) return;
  const serviceId = process.env.SERVICE_ID;
  const result = JSON.parse(JSON.stringify(document));
  const newPaths = {};
  const pathsWithService = {};
  for (const path of Object.keys(result.paths)) {
    const shortPath = removeServiceIdFromPath(serviceId, path);
    newPaths[shortPath] = result.paths[path];
    pathsWithService['/' + serviceId + path] = document.paths[path];
    for (const method of Object.keys(newPaths[shortPath])) {
      if (
        !newPaths[shortPath][method].security?.length &&
        !newPaths[shortPath][method].tags?.includes('x-open-endpoint')
      ) {
        delete newPaths[shortPath][method];
      }
      if (!Object.keys(newPaths[shortPath]).length) {
        delete newPaths[shortPath];
      }
    }
  }
  result.paths = newPaths;
  document.paths = pathsWithService;
  const specAsYaml = yaml.stringify(result, { aliasDuplicateObjects: false, singleQuote: true });
  if (serviceId !== 'api') fs.writeFileSync(openApiFilePath, specAsYaml);
}

export function exportOpenApiFromExpress(
  routes: RouteMetaData[],
  additionalConverters: ISchemaConverters
) {
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/',
    additionalConverters: {
      IsStringOrNumber: {
        oneOf: [{ type: 'string' }, { type: 'number' }],
      },
      ...additionalConverters,
    },
  });
  // @ts-ignore
  baseOpenApiDoc.components.schemas = schemas;
  const paths: Record<string, Record<string, TwOperationObject>> = {};
  for (const route of routes) {
    transformExpressPathToOpenApi(route);
    const method = route.method;
    if (route?.metadata?.args?.authError) {
      throw new Error(`The endpoint ${route.path} is not handling authorization!!`);
    }
    const apiConfigArgs: ApiConfigArgs & { parts: ('body' | 'query')[] } = route?.metadata?.args;
    const transformedPath = transformExpressPathToOpenApi(route);
    const path = getAlternativePath(transformedPath, apiConfigArgs) || transformedPath;
    const interfaces = apiConfigArgs?.openApi?.interfaces;
    if (!interfaces?.length) continue;
    if (!paths[path]) paths[path] = {};
    paths[path][method] = defaultOpenApiOperation(route.path, method, apiConfigArgs?.openApi);
    paths[path][method].parameters = route.pathParams.map((p) => {
      p.schema = { type: 'string' };
      return p;
    });
    if (!apiConfigArgs) continue;
    if (apiConfigArgs.parts.includes('body')) {
      const className = apiConfigArgs.body.constructor.name;
      paths[path][method].requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${className}`,
            },
          },
        },
      };
    }
    if (apiConfigArgs.parts.includes('query')) {
      const className = apiConfigArgs.query.constructor.name;
      paths[path][method].parameters.push({
        in: 'query',
        name: className,
        schema: {
          $ref: `#/components/schemas/${className}`,
        },
        required: true,
      });
    }
    if ('resBody' in apiConfigArgs) {
      const className = apiConfigArgs.resBody.constructor.name;
      paths[path][method].responses = {
        200: {
          description: 'A successful response',
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${className}`,
              },
            },
          },
        },
      };
    }
    if ('rateLimits' in apiConfigArgs) {
      addRateLimits(paths[path][method], apiConfigArgs.rateLimits);
    }
    if (apiConfigArgs.openApi?.websocket) {
      paths[path][method]['x-tw'].websocket = true;
    }

    if (apiConfigArgs.openApi?.corsAllowAll) {
      paths[path][method]['x-tw'].corsAllowAll = true;
    }

    paths[path][method] = { ...apiConfigArgs?.openApi?.operation, ...paths[path][method] };
  }
  for (const path of Object.keys(extraPaths)) {
    for (const method of Object.keys(extraPaths[path])) {
      if (!paths[path]) paths[path] = {};
      paths[path][method] = extraPaths[path][method];
    }
  }

  baseOpenApiDoc.paths = paths;
  if (Object.keys(paths).length) {
    const specAsYaml = yaml.stringify(baseOpenApiDoc, {
      aliasDuplicateObjects: false,
      singleQuote: true,
    });
    fs.writeFileSync(openApiFilePath, specAsYaml);
  }
}

export function addPathToOpenApi(path: string, method: string, op: TwOperationObject) {
  if (!extraPaths[path]) extraPaths[path] = {};
  extraPaths[path][method] = op;
}
