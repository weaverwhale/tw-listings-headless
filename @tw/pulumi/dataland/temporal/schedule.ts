import { ScheduleSpec } from '@temporalio/client';
import { createTemporalSchedule } from '../../temporal';
import { getConfigs } from '../../utils';
import {
  changesetDatasetId,
  getDataformRepositoryIdForProject,
  latestDatasetId,
  rawDatasetId,
  rootDatasetId,
} from '../names';

export function createChronosSchedule(
  args: {
    scheduleId?: string;
    spec?: ScheduleSpec;
    labels?: string[];
    inputBQTable?: string;
    bqProjectResource?: string;
  } = {}
) {
  const { stack, serviceId, projectId } = getConfigs();
  const {
    scheduleId = 'schedule',
    spec = {
      intervals: [{ every: '1 hour' }],
    },
    labels = ['primary'],
    inputBQTable = serviceId,
    bqProjectResource = projectId,
  } = args;

  createTemporalSchedule('schedule', {
    projectId,
    serviceId,
    namespace: `${serviceId}-chronos`,
    scheduleId,
    spec,
    action: {
      type: 'startWorkflow',
      workflowType: 'cdcWorkflow',
      taskQueue: 'queue',
      args: [
        {
          stack,
          pipeline: serviceId,
          isDerived: false,
          dependencies: [],
          labels,
          inputBQDataset: rawDatasetId,
          inputBQTable,
          rootBQDataset: rootDatasetId,
          publicBQDataset: latestDatasetId,
          changesetDatasetId: changesetDatasetId,
          outputBQTable: serviceId,
          dataformBranch: stack === 'shofifi' ? 'master' : 'develop',
          dataformRepository: getDataformRepositoryIdForProject(
            bqProjectResource,
            bqProjectResource
          ),
          bqProjectResource,
        },
      ],
    },
  });
}
