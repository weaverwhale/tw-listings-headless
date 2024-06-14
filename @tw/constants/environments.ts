import { isProdFunc, isStagingFunc } from './utils';

export const projectId = process.env.PROJECT_ID;
export const serviceId = process.env.SERVICE_ID;
export const providerId = process.env.PROVIDER_ID;
export const isProd = isProdFunc(projectId);
export const isStaging = isStagingFunc(projectId);
export const isLocal = process.env.IS_LOCAL === 'true';
export const isK8s = Boolean(process.env.IS_K8S);
export const isDocker = process.env.IS_DOCKER === 'true';
export const serviceAccountFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

export const localHost = isDocker ? '172.17.0.1' : 'localhost';

export const projectIds = ['shofifi', 'triple-whale-staging'];

// backend
export const projectIdToHostMap = {
  'triple-whale-staging': 'staging.api.triplewhale.com',
  shofifi: 'api.triplewhale.com',
};

// frontend
export const projectIdToAppDomain = {
  'triple-whale-staging': 'stg.app.triplewhale.com',
  shofifi: 'app.triplewhale.com',
};

// admin frontend
export const projectIdToAdminDomain = {
  'triple-whale-staging': 'staging.admin.triplewhale.com',
  shofifi: 'admin.triplewhale.com',
};

export const projectIdToDevPortalDomain = {
  'triple-whale-staging': 'staging.developers.triplewhale.com',
  shofifi: 'developers.triplewhale.com',
};

export const appDomain = projectIdToAppDomain[projectId];
export const adminDomain = projectIdToAdminDomain[projectId];
export const devPortalDomain = projectIdToDevPortalDomain[projectId];

export const appLink = 'https://app.triplewhale.com/';

export function getProjectSubDomain(projectId) {
  const projectMap = {
    shofifi: '',
    'triple-whale-staging': 'stg.',
  };
  return projectMap[projectId];
}

export function projectIdAsSubDomain(projectId) {
  return `${projectId}.`;
}
