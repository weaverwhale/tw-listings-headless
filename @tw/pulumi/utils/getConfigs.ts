import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import * as fs from 'fs';
import { loadServiceConfig } from '../service';
import { ServiceConfig } from '@tw/types';

export const serviceConfigFile = '../tw-config.json';

let cache: {
  projectId: string;
  serviceId: string;
  location: string;
  config: pulumi.Config;
  gcpConfig: pulumi.Config;
  stack: string;
  isMultiPerProject: boolean;
  projectNumber: pulumi.Output<string>;
  isAService: boolean;
  serviceConfig?: ServiceConfig;
  isSensory?: boolean;
};

export function getConfigs() {
  if (cache) return cache;
  const serviceId = pulumi.getProject();
  const config = new pulumi.Config();
  const stack = pulumi.getStack();
  const projectNumber = gcp.organizations.getProjectOutput({}).number;
  const gcpConfig = new pulumi.Config('gcp');
  const location = config.require('gcpLocation');
  const projectId = gcpConfig.require('project');
  const isMultiPerProject = stack !== projectId;
  const isAService =
    config.get('notAService') === 'false' ||
    (config.get('notAService') !== 'true' && fs.existsSync(serviceConfigFile));
  const serviceConfig = loadServiceConfig();
  const isSensory = Boolean(serviceConfig?.sensory);
  cache = {
    projectId,
    serviceId,
    location,
    config,
    gcpConfig,
    stack,
    isMultiPerProject,
    projectNumber,
    isAService,
    serviceConfig,
    isSensory,
  };
  return cache;
}
