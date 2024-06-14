import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as fs from 'fs';
import { getConfigs } from '../utils';
import { toJSONOutput } from '../pulumi-utils';
import { getServiceImage } from '../utils/getServiceImage';
import { createBuildTrigger } from '../cloud-build';
import { createDataFlowPipeline } from './pipeline';

export async function createDataFlowTemplate() {
  const { projectId, serviceId } = getConfigs();
  const metadata = JSON.parse(fs.readFileSync('../metadata.json', 'utf8').toString());

  const completeMetadata = {
    defaultEnvironment: {},
    image: getServiceImage(),
    metadata,
    sdkInfo: { language: 'PYTHON' },
  };
  const object = new gcp.storage.BucketObject(
    `${serviceId}-dataflow-flex`,
    {
      name: `flex/${serviceId}/${process.env.GITHUB_SHA || 'latest'}.json`,
      bucket: `dataflow-templates-${projectId}`,
      content: toJSONOutput(completeMetadata),
    },
    { retainOnDelete: true }
  );

  return { object };
}

export async function createDataFlowFlex(args: {
  parameters: Record<string, pulumi.Input<string>>;
  maxWorkers?: number;
}) {
  const { parameters, maxWorkers = 10 } = args;
  const { serviceId } = getConfigs();

  const { object } = await createDataFlowTemplate();
  const pipeline = createDataFlowPipeline({
    name: serviceId,
    templateType: 'flex',
    maxWorkers,
    parameters,
    gcsPath: pulumi.interpolate`gs://${object.bucket}/${object.name}`,
  });
  return { pipeline };
}

export function createDataFlowFlexBuild() {
  const { serviceId } = getConfigs();
  createBuildTrigger({
    name: serviceId,
    baseDir: 'pipelines',
    runtime: 'beam-python',
  });
}
