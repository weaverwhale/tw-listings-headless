import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs, createLabels } from '../utils';
import { dataflowParameters, EnvironmentArgs } from './types';
import { getCurrentNumWorkers, getMostRecentJob, getPipeline, isJobActive } from './api';
import { globalState } from '../utils/globalState';

const INITIAL_WORKERS = 10;

export async function createDataFlowPipeline(args: {
  name: string;
  templateType: 'flex' | 'classic';
  maxWorkers?: number;
  parameters: dataflowParameters;
  environment?: EnvironmentArgs;
  gcsPath: pulumi.Input<string>;
  dependsOn?: pulumi.Input<pulumi.Resource> | pulumi.Input<pulumi.Input<pulumi.Resource>[]>;
}) {
  globalState['gcp:dataflow/pipeline:Pipeline'] = [];
  const { name, templateType, maxWorkers, parameters, environment, gcsPath, dependsOn } = args;
  const { projectId, location } = getConfigs();

  let mostRecentNumWorkers;
  const pipelineExists = await getPipeline();
  if (pipelineExists) {
    const job = await getMostRecentJob();
    if (job) {
      if (await isJobActive(job)) {
        mostRecentNumWorkers = await getCurrentNumWorkers(job.id);
      }
    }
  }
  const numWorkers = Math.min(mostRecentNumWorkers || INITIAL_WORKERS, maxWorkers);

  const environmentArgs: EnvironmentArgs = {
    additionalExperiments: ['enable_data_sampling'],
    network: 'app',
    subnetwork: `https://www.googleapis.com/compute/v1/projects/${projectId}/regions/${location}/subnetworks/app`,
    tempLocation: `gs://tw-dataflows-${projectId}/${name}/temp`,
    machineType: 'e2-standard-4',
    additionalUserLabels: {
      ...createLabels(),
    },
    workerRegion: location,
    numWorkers,
    maxWorkers,
  };

  const pipelineArgs: gcp.dataflow.PipelineArgs = {
    displayName: name,
    type: 'PIPELINE_TYPE_STREAMING',
    state: 'STATE_ACTIVE',
    name: name,
    region: location,
  };

  const combinedEnvironment = { ...environmentArgs, ...environment };

  if (templateType === 'flex') {
    pipelineArgs.workload = {
      dataflowFlexTemplateRequest: {
        projectId,
        launchParameter: {
          jobName: name,
          containerSpecGcsPath: gcsPath,
          parameters,
          environment: combinedEnvironment,
        },
        location,
      },
    };
  } else if (templateType === 'classic') {
    pipelineArgs.workload = {
      dataflowLaunchTemplateRequest: {
        projectId,
        gcsPath,
        launchParameters: {
          jobName: name,
          parameters,
          environment: combinedEnvironment,
        },
        location,
      },
    };
  }

  const pipeline = new gcp.dataflow.Pipeline(name, pipelineArgs, {
    deleteBeforeReplace: true,
    replaceOnChanges: ['workload'],
    dependsOn,
  });
  return pipeline;
}
