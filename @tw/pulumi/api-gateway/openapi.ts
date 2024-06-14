import * as gcp from '@pulumi/gcp';
import * as fs from 'fs';
import * as pulumi from '@pulumi/pulumi';
import yaml from 'yaml';
import { getAudience, getBaseUrl, getConfigs } from '../utils';
import { CloudRun, serviceTarget } from '../types';
import { toYamlOutput } from '../pulumi-utils';

export function uploadAPIConfig(
  filePath: string,
  service: serviceTarget,
  settings: { removePrefix?: boolean } = {}
) {
  if (!fs.existsSync(filePath)) {
    if (!(process.env.IS_LOCAL === 'true')) console.log(`file ${filePath} does not exist!`);
    return;
  }
  const { removePrefix } = settings;
  const { serviceId, projectId } = getConfigs();
  const rawConfig = yaml.parse(fs.readFileSync(filePath).toString());
  const finalSpec = configureForEndpoints(rawConfig, service, removePrefix);
  const outputOpenAPIspecs = [
    {
      ext: 'yml',
      contents: toYamlOutput(finalSpec),
    },
    {
      ext: 'json',
      contents: finalSpec.apply((v) => JSON.stringify(v)),
    },
  ];
  for (const spec of outputOpenAPIspecs) {
    new gcp.storage.BucketObject(`api-gateway-config-${spec.ext}`, {
      bucket: `devops-${projectId}`,
      content: spec.contents,
      name: `api-gateway/${spec.ext}/${serviceId}.${spec.ext}`,
    });
  }
}

export function configureForEndpoints(
  rawConfig: any,
  service: serviceTarget,
  removePrefix: boolean
) {
  const serviceId = pulumi.getProject();
  const newPaths = {};
  for (let path of Object.keys(rawConfig.paths)) {
    if (path === '/') path = '';
    let newPath = `/${serviceId}${path}`;
    newPaths[newPath] = {};
    for (const method of Object.keys(rawConfig.paths[path])) {
      const operation = rawConfig.paths[path][method];
      const xTw = operation?.['x-tw'] || {};
      const pathPrefix = xTw?.pathPrefix;
      if (!xTw?.deployment) {
        // @ts-ignore
        xTw.deployment = service.name || serviceId;
      }
      const altPathPrefix = pathPrefix && pathPrefix !== serviceId;
      if (altPathPrefix) {
        newPath = `/${pathPrefix}${path}`;
        if (!newPaths[newPath]) newPaths[newPath] = {};
      }
      newPaths[newPath][method] = operation;
      let backendSettings;
      const audience = {
        ...(!(service instanceof CloudRun) ? { jwt_audience: getAudience(service) } : null),
      };
      if (!removePrefix && !altPathPrefix) {
        backendSettings = {
          address: getBaseUrl(service),
          protocol: 'http/1.1',
          path_translation: 'APPEND_PATH_TO_ADDRESS',
          ...audience,
        };
      } else {
        backendSettings = {
          address: pulumi.interpolate`${getBaseUrl(service)}${path}`,
          protocol: 'http/1.1',
          path_translation: 'CONSTANT_ADDRESS',
          ...audience,
        };
      }
      newPaths[newPath][method]['x-google-backend'] = {
        ...backendSettings,
        ...newPaths[newPath][method]['x-google-backend'],
      };
      newPaths[newPath][method]['operationId'] = `${
        operation?.tags?.length ? operation?.tags[0] : serviceId
      }-${operation['operationId']}`;
    }
  }
  Object.keys(newPaths).map((p) => {
    if (!Object.keys(newPaths[p]).length) delete newPaths[p];
  });
  rawConfig.paths = newPaths;
  return pulumi.output(rawConfig);
}
