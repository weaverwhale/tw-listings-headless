import path from 'path';
import { Services } from './types';

export const cliConfig: {
  proxyPort: number;
  proxySsl: boolean;
  projectId: string;
  PWD: string;
  currentDirname: string;
  emulatorsReady: boolean;
  temporalReady: boolean;
  servicesRoot: string;
  pipelinesRoot: string;
  packagesRoot: string;
  gitRoot: string;
  clientRoot: string;
  services: Services;
} = {
  proxyPort: 80,
  proxySsl: false,
  projectId: 'triple-whale-staging',
  PWD: process.env.PWD,
  currentDirname: process.env.PWD?.split(path.sep)?.pop(),
  emulatorsReady: false,
  temporalReady: false,
  servicesRoot: null,
  pipelinesRoot: null,
  packagesRoot: null,
  gitRoot: null,
  clientRoot: null,
  services: {},
};

export function initConfig(argv) {
  // projectId
  if (argv['project'] || argv['project-id']) {
    cliConfig.projectId = argv['project'] || argv['project-id'];
  }
  if (argv.prod) {
    cliConfig.projectId = 'shofifi';
  } else if (argv.stg) {
    cliConfig.projectId = 'triple-whale-staging';
  }
  process.env.PROJECT_ID = cliConfig.projectId;
  process.env.GCLOUD_PROJECT = process.env.PROJECT_ID;
  if (argv['ignore-admin']) {
    process.env.IGNORE_ADMIN = '1';
  }

  // proxySsl
  if (argv.ssl) {
    cliConfig.proxySsl = true;
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  }
}
