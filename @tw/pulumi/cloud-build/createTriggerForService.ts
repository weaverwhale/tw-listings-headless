import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getGitRepoName, getGithubOrg } from '@tw/devops';
import * as fs from 'fs';
import { getDevopsImage } from './utils';
import { getConfigs } from '../utils/getConfigs';
import { getSecretId } from '../utils';
import { CreateBuildTriggerArgs } from './types';
import { globalState } from '../utils/globalState';

export function createBuildTrigger(args: CreateBuildTriggerArgs = {}) {
  const { serviceId, projectId, location, isMultiPerProject, config } = getConfigs();
  const {
    name = `${serviceId}-service`,
    workerPool,
    runtime = 'node',
    moreSteps = [],
    k8s,
    dockerfileRun,
    baseDir = 'services',
    dockerfileCacheRun,
    dockerBuildEnvs = [],
    machineType,
    downloadFilesFromGcs,
  } = args;
  if (isMultiPerProject) return;
  const stepsBefore: gcp.types.input.cloudbuild.TriggerBuildStep[] = [];

  const volumes = [];

  let runtimeBaseImage = args.runtimeBaseImage;
  if (downloadFilesFromGcs?.length) {
    volumes.push({ name: 'tw-extra', path: '/tw-extra' });
    stepsBefore.push({
      name: 'gcr.io/cloud-builders/gsutil:latest',
      args: [
        'cp',
        '-r',
        ...downloadFilesFromGcs.map((f) => `gs://${f.bucket}/${f.filename}`),
        '/tw-extra',
      ],
      volumes,
      id: 'download-files-from-gcs',
    });
  }
  const pulumiImage = k8s ? 'pulumi-kubectl' : 'pulumi';
  let runtimeImageTag = 'latest';
  if (runtime === 'python' && k8s?.gpu) {
    runtimeBaseImage = getDevopsImage('cuda-python');
  } else if (runtime === 'node') {
    // check in ../package-lock.json if there is a dependency on node-gyp
    const packageLock = fs.readFileSync('../package-lock.json', 'utf8').toString();
    const hasNodeGyp = packageLock.includes(`"node-gyp"`);
    runtimeImageTag = hasNodeGyp ? 'fat' : 'latest';
    runtimeBaseImage = getDevopsImage('base-node', '$_RUNTIME_IMAGE_TAG');
  }
  if (!runtimeBaseImage) {
    if (globalState['gcp:dataflow/pipeline:Pipeline']) {
      runtimeBaseImage = getDevopsImage(`base-beam-${runtime}`);
    }
  }
  if (runtimeBaseImage) {
    dockerBuildEnvs.push(pulumi.interpolate`RUNTIME_BASE_IMAGE=${runtimeBaseImage}`);
  }
  if (dockerfileRun) {
    dockerBuildEnvs.push(`ADD_COMMAND=${dockerfileRun}`);
  }
  if (dockerfileCacheRun) {
    dockerBuildEnvs.push(`ADD_COMMAND_CACHE=${dockerfileCacheRun}`);
  }
  const steps: gcp.types.input.cloudbuild.TriggerBuildStep[] = [
    ...stepsBefore,
    {
      name: getDevopsImage('docker-builder'),
      envs: [
        'PROJECT_ID=$PROJECT_ID',
        `SERVICE_ID=$_SERVICE_ID`,
        `SERVICE_DIR=${baseDir}/$_SERVICE_ID`,
        'COMMIT_SHA=$COMMIT_SHA',
        'REF=$_REF',
        'STACK=$_STACK',
        `RUNTIME=$_RUNTIME`,
        ...dockerBuildEnvs,
      ],
      volumes,
      id: 'build',
      waitFors: ['-'],
    },
    ...moreSteps,
    {
      name: getDevopsImage('$_PULUMI_IMAGE'),
      script: 'run-pulumi',
      dir: `${baseDir}/$_SERVICE_ID/infra`,
      secretEnvs: ['PULUMI_ACCESS_TOKEN'],
      envs: [
        `SERVICE_ID=$_SERVICE_ID`,
        'GITHUB_SHA=$COMMIT_SHA',
        'COMMIT_SHA=$COMMIT_SHA',
        'LOCATION=$LOCATION',
        'BUILD_ID=$BUILD_ID',
        'PROJECT_ID=$PROJECT_ID',
        'STACK=$_STACK',
        'AUTHOR=$_AUTHOR',
        'IS_CLOUD_BUILD=true',
        'BUILD_ENVS=$_BUILD_ENVS',
      ],
      waitFors: ['build', ...moreSteps?.map((s) => s.id).filter(Boolean)],
      id: 'pulumi',
    },
  ];

  // get all images needed for the steps, and add a step to pull them
  const images = steps.filter((s) => s.waitFors[0] !== '-').map((s) => s.name);

  steps.unshift({
    name: 'gcr.io/cloud-builders/docker',
    script: pulumi.all(images.map((i) => pulumi.interpolate`docker pull ${i}`)).apply((images) => {
      return images.join(' & ');
    }),
    id: 'pull-images',
    envs: [
      '_SERVICE_ID=$_SERVICE_ID',
      '_RUNTIME=$_RUNTIME',
      '_RUNTIME_IMAGE_TAG=$_RUNTIME_IMAGE_TAG',
      '_PULUMI_IMAGE=$_PULUMI_IMAGE',
    ],
    waitFors: ['-'],
  });

  const secretsUsed = steps
    .filter((s) => s.secretEnvs)
    .map((s) => s.secretEnvs as string[])
    .reduce((acc, val) => acc.concat(val), []);

  const secretManagers = [
    {
      versionName: getSecretId('pulumi-access-token'),
      env: 'PULUMI_ACCESS_TOKEN',
    },
  ];

  if (secretsUsed.includes('CLOUDFLARE_API_TOKEN')) {
    secretManagers.push({
      versionName: getSecretId('cloudflare-token-pulumi'),
      env: 'CLOUDFLARE_API_TOKEN',
    });
  }

  const options: gcp.cloudbuild.TriggerArgs = {
    name: name,
    build: {
      steps,
      substitutions: {
        _SERVICE_ID: serviceId,
        _RUNTIME: runtime,
        _RUNTIME_IMAGE_TAG: runtimeImageTag,
        _PULUMI_IMAGE: pulumiImage,
      },
      availableSecrets: {
        secretManagers,
      },
      timeout: '3600s',
      options: {
        ...(machineType ? { machineType } : null),
      },
    },
    tags: [`serviceId:${serviceId}`],
    sourceToBuild: {
      ref: 'refs/heads/master',
      repoType: 'GITHUB',
      uri: pulumi.interpolate`https://github.com/${pulumi.output(getGithubOrg())}/${pulumi.output(
        getGitRepoName()
      )}`,
    },
  };

  if (workerPool) {
    options.build['options'] = {
      workerPool: `projects/${projectId}/locations/${location}/workerPools/${workerPool}`,
    };
  }

  new gcp.cloudbuild.Trigger(name, options, { aliases: [{ name: 'cloud-build-trigger' }] });
  if (config.getBoolean('require-approval')) {
    new gcp.cloudbuild.Trigger('cloud-build-trigger-approve', {
      ...options,
      name: `${options.name}-approve`,
      approvalConfig: { approvalRequired: true },
    });
  }
}
