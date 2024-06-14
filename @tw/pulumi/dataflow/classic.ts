import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';
import { getConfigs } from '../utils';
import { createBuildTrigger, getBuildVersion, getDevopsImage } from '../cloud-build';
import { getServiceImage } from '../utils/getServiceImage';
import { getGitSha } from '@tw/devops';
import { dataflowParametersToCMDArgs } from './utils';
import { getSecretValue } from '../secrets';
import { createDataFlowPipeline } from './pipeline';
import { toJSONOutput } from '../pulumi-utils';

export function createDataFlowClassic(args: {
  parameters?: Record<string, pulumi.Input<string>>;
  maxWorkers?: number;
  runtime: 'node' | 'python';
  entrypoint?: string;
  secretVersion?: gcp.secretmanager.SecretVersion;
  envs?: Record<string, any>;
}) {
  const { parameters = {}, maxWorkers = 10, runtime, secretVersion } = args;
  const { projectId, serviceId, location, serviceConfig, stack } = getConfigs();

  const entrypoint = args.entrypoint || (runtime == 'node' ? 'dist/app.js' : 'src/app.py');

  if (secretVersion) {
    parameters['tw_secret_name'] = secretVersion.name;
  }

  const envs = {
    ...serviceConfig?.env,
    SERVICE_ID: serviceId,
    TW_VERSION: getBuildVersion(),
    TW_DEPLOYMENT: serviceId,
    STACK_NAME: stack,
  };

  parameters['tw_envs'] = toJSONOutput({ ...envs, ...args.envs });

  const parametersString = dataflowParametersToCMDArgs(parameters);

  const gitSha = pulumi.output(getGitSha(false));

  const gcsPath = pulumi.interpolate`gs://dataflow-templates-${projectId}/classic/${serviceId}/${gitSha}.json`;

  const standardArgs = pulumi.interpolate`--project=${projectId} --runner=dataflow --region=${location} \
    --temp_location gs://tw-dataflows-${projectId}/${serviceId}/temp --staging_location gs://tw-dataflows-${projectId}/${serviceId}/temp \
    --sdkContainerImage ${getDevopsImage(`beam-worker-${runtime}`)} ${parametersString}`;

  let command = pulumi.output('');

  if (runtime === 'node') {
    command = pulumi.interpolate`node ${entrypoint} ${standardArgs} --template_location="${gcsPath}"`;
  } else if (runtime === 'python') {
    command = pulumi.interpolate`python3 ${entrypoint} ${standardArgs} --template_location="${gcsPath}"`;
  }

  const secretValue = secretVersion?.secret && getSecretValue(secretVersion.secret);
  const dockerArgs: docker.ContainerArgs = {
    image: getServiceImage(),
    attach: true,
    logs: false,
    mustRun: false,
    entrypoints: ['bash'],
    envs: [
      `PROJECT_ID=${projectId}`,
      pulumi.interpolate`COMMIT_SHA=${gitSha}`,
      `GOOGLE_CLOUD_PROJECT=${projectId}`,
      pulumi.interpolate`TW_SECRETS=${secretValue}`,
    ],
    command: ['-c', command],
  };

  if (process.env.IS_CLOUD_BUILD) {
    dockerArgs.networksAdvanced = [{ name: 'cloudbuild' }];
  } else {
    dockerArgs.mounts = [
      {
        source: `${process.env.HOME}/.config/gcloud`,
        target: '/root/.config/gcloud',
        type: 'bind',
      },
    ];
  }

  const container = new docker.Container(serviceId, dockerArgs, { retainOnDelete: true });

  // container.name.apply((name) => {
  //   try {
  //     docker.getLogs({ name }).then((logs) => {
  //       console.log(logs.logsListStrings.join('\n'));
  //     });
  //   } catch {}
  // });

  const pipeline = createDataFlowPipeline({
    name: serviceId,
    parameters: parameters,
    maxWorkers: maxWorkers,
    gcsPath,
    templateType: 'classic',
    dependsOn: [container],
  });
  return { pipeline };
}

export function createDataFlowClassicBuild(args?: { runtime?: 'node' | 'python' }) {
  const { serviceId } = getConfigs();
  const { runtime } = args || {};
  createBuildTrigger({
    name: serviceId,
    baseDir: 'pipelines',
    runtime,
    machineType: 'E2_HIGHCPU_8',
    runtimeBaseImage: runtime === 'node' ? getDevopsImage('base-beam-node') : null,
  });
}
