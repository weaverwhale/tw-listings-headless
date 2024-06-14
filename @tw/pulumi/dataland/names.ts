import {
  getCloudRunServiceId,
  getDataformRepoId,
  getPubsubTopicId,
  getUniqueNameInProject,
  getConfigs,
  createAuthProxyUrl,
} from '../utils';
import { projectId } from '../constants';
import * as gcp from '@pulumi/gcp';
import { ServiceEntryDeployment } from '@tw/types';
const { stack } = getConfigs();

function getUniqueDatasetName(name: string) {
  return (getUniqueNameInProject(name, '_') as string).replaceAll('-', '_');
}

export const publicDatasetId = getUniqueDatasetName('dataland_public');
export const rawDatasetId = getUniqueDatasetName('dataland_raw');
export const rootDatasetId = getUniqueDatasetName('dataland_root');
export const latestDatasetId = getUniqueDatasetName('dataland_latest');
export const compactedDatasetId = getUniqueDatasetName('dataland_compacted');
export const functionsDatasetId = getUniqueDatasetName('dataland_functions');
export const changesetDatasetId = getUniqueDatasetName('dataland_changeset');
export const recentDatasetId = getUniqueDatasetName('dataland_recent');
export const errorsDatasetId = getUniqueDatasetName('dataland_errors');
export const dataQualityDatasetId = getUniqueDatasetName('dataland_data_quality');
export const scdpHelpersDatasetId = getUniqueDatasetName('dataland_scdp_helpers');
export const archiveDatasetId = getUniqueDatasetName('dataland_archive');
export const currentDatasetId = getUniqueDatasetName('dataland_current');
// for dataform repositories, we do not always use the same stack and project
// so we need to pass those in as params
export function getDataformRepositoryNameForProject(projectId: string) {
  return `dataland${
    ['shofifi', 'triple-whale-staging'].includes(projectId) ? '' : `-${projectId}`
  }`;
}
export function getDataformRepositoryIdForProject(stack: string, projectId: string) {
  return getDataformRepoId(projectId, getDataformRepositoryNameForProject(stack));
}

export const deadLetterTopicName = getUniqueNameInProject('dataland-dead-letter-topic') as string;
export const deadLetterTopicId = getPubsubTopicId(deadLetterTopicName);

export const chronosIngestServiceId = getCloudRunServiceId(
  getUniqueNameInProject('chronos-ingest') as string
);

export const chronosIngestService: ServiceEntryDeployment = {
  name: 'chronos-ingest',
  endpoints: {
    authenticated: {
      audience: 'chronos-ingest',
      type: 'authenticated',
      url: createAuthProxyUrl('chronos-ingest') as any,
    },
  },
};

export const workflowServiceAccountId = 'dataland-workflow';
export const workflowServiceAccountEmail = `${getUniqueNameInProject(
  workflowServiceAccountId,
  '-',
  true
)}@${projectId}.iam.gserviceaccount.com`;

export const schedulerServiceAccountId = 'dataland-scheduler';
export const schedulerServiceAccountEmail = `${getUniqueNameInProject(
  schedulerServiceAccountId
)}@${projectId}.iam.gserviceaccount.com`;
