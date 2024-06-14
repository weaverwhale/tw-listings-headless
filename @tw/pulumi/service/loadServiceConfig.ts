import { ServiceConfig } from '@tw/types';
import * as fs from 'fs';
import { resolve } from 'path';
import * as pulumi from '@pulumi/pulumi';
import { serviceConfigFile } from '../utils/getConfigs';

let serviceConfig;

export function loadServiceConfig(): ServiceConfig {
  if (serviceConfig) return serviceConfig;
  try {
    serviceConfig = JSON.parse(fs.readFileSync(resolve(serviceConfigFile)).toString());
  } catch {
    // local prob
    serviceConfig = { color: 'none', contacts: [], maintainers: [] };
  }
  return serviceConfig;
}

export function updateServiceConfig(serviceConfig: ServiceConfig) {
  pulumi.output(serviceConfig).apply((o) => {
    fs.writeFileSync(resolve(serviceConfigFile), JSON.stringify(o, null, 2) + '\n');
  });
}
