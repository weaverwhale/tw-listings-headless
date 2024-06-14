import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { getDefaultComputeServiceAccount } from '../iam';
import { isProduction } from '../constants';
import { convertEnvs } from '../utils/helpers';
import { getCloudRunUrl } from './utils';
import { createLabels, getUniqueNameInProject, sortEnvs } from '../utils';
import { getServiceImage } from '../utils/getServiceImage';
import { addServiceEntryDeployment } from '../service/serviceEntry';
import { ServiceEntryDeployment } from '@tw/types';
import { monitoringState } from '../monitoring/state';
import { pythonWorkers } from '../utils/python';
import { k8sMemoryToNumberMi } from '../k8s/utils';
import { loadServiceConfig } from '../service';
import { K8sCPU } from '../k8s';
import { getServiceDefaultEnvs, serviceEnvs } from '../service/serviceEnvs';

export function createCloudRunService(
  serviceId: string,
  projectId: string,
  location: string,
  settings: {
    secretVersion?: gcp.secretmanager.SecretVersion;
    allowUnauthenticated?: boolean;
    concurrency?: number;
    maxInstances?: number;
    minInstances?: number;
    alwaysOnCPU?: boolean;
    timeoutSeconds?: number;
    memoryLimit?: string;
    CPULimit?: K8sCPU;
    vpcConnectorName?: any;
    vpcAccessEgress?: 'private-ranges-only' | 'all';
    serviceMod?: string;
    legacySecrets?: boolean;
    serviceAccount?: gcp.serviceaccount.Account;
    executionEnvironment?: 'gen1' | 'gen2';
    dockerImage?: string;
    envs?: any;
    ports?: number[];
    containerArgs?: string[];
    startupCpuBoost?: boolean;
  } = {},
  serviceArgs?: gcp.cloudrun.ServiceArgs
) {
  monitoringState.cloudRun.enabled = true;
  const {
    secretVersion,
    allowUnauthenticated,
    maxInstances,
    minInstances,
    alwaysOnCPU,
    timeoutSeconds = 600,
    memoryLimit = '1Gi',
    CPULimit = 1,
    vpcConnectorName = 'app-vpc-connector',
    vpcAccessEgress = 'private-ranges-only',
    serviceMod,
    legacySecrets,
    serviceAccount,
    executionEnvironment,
    dockerImage = getServiceImage(),
    envs,
    ports,
    containerArgs,
    startupCpuBoost = false,
  } = settings;
  // this is a temp solution to multiple resource settings for one
  // service. the ideal here would be the ability to deploy multiple
  // revisions as two different resources. this is something that we should still
  // look into. also i'd like to check if k8s would have solved this one.
  let cloudRunServiceName = serviceId;
  if (serviceMod && !process.env.IS_LOCAL) {
    cloudRunServiceName += `-${serviceMod}`;
  }
  const serviceConfig = loadServiceConfig();
  const { workers, concurrency } = pythonWorkers({
    cpu: CPULimit,
    concurrency: settings.concurrency,
    serviceConfig,
  });
  const deploymentEnvs = [
    ...convertEnvs(envs),
    ...convertEnvs(serviceConfig?.env),
    ...getServiceDefaultEnvs(),

    { name: 'gracefulTerminationTimeout', value: String(timeoutSeconds * 1000) || '' },
    { name: 'WEB_CONCURRENCY', value: String(workers) },
    { name: 'TW_MEM_REQUEST', value: String(k8sMemoryToNumberMi(memoryLimit)) },
    ...convertEnvs(serviceEnvs),
  ];
  let ownServiceArgs: gcp.cloudrun.ServiceArgs = {
    name: getUniqueNameInProject(cloudRunServiceName),
    location,
    autogenerateRevisionName: true,
    metadata: {
      labels: createLabels(),
      annotations: {
        'run.googleapis.com/ingress': 'all',
      },
    },
    template: {
      spec: {
        containers: [
          {
            image: dockerImage,
            resources: { limits: { memory: memoryLimit, cpu: String(CPULimit) || '1' } },
            envs: sortEnvs(deploymentEnvs),
            ports: ports?.map((port) => {
              return { containerPort: port };
            }),
            args: containerArgs,
          },
        ],
        containerConcurrency: concurrency ?? 80,
        timeoutSeconds: timeoutSeconds ?? 300,
      },
      metadata: {
        labels: {
          'run.googleapis.com/startupProbeType': 'Default',
          ...createLabels(),
        },
        annotations: {
          'autoscaling.knative.dev/maxScale': String(maxInstances || 100),
          'autoscaling.knative.dev/minScale': String((isProduction && minInstances) || 0),
          'run.googleapis.com/cpu-throttling': String(alwaysOnCPU ? false : true),
          ...(startupCpuBoost
            ? { 'run.googleapis.com/startup-cpu-boost': String(startupCpuBoost) }
            : null),
        },
      },
    },
    traffics: [
      {
        latestRevision: true,
        percent: 100,
      },
    ],
    ...serviceArgs,
  };
  if (secretVersion) {
    ownServiceArgs = addSecrets(ownServiceArgs, serviceId, secretVersion, legacySecrets);
  }
  if (vpcConnectorName) {
    ownServiceArgs = addVpcConnector(
      ownServiceArgs,
      projectId,
      location,
      vpcConnectorName,
      vpcAccessEgress
    );
  }
  if (serviceAccount) {
    ownServiceArgs.template['spec'].serviceAccountName = serviceAccount.email;
  } else {
    ownServiceArgs.template['spec'].serviceAccountName = getDefaultComputeServiceAccount();
  }
  const service = new gcp.cloudrun.Service(
    `${cloudRunServiceName}-default-cloud-run`,
    ownServiceArgs,
    { ignoreChanges: ['metadata.annotations.["run.googleapis.com/operation-id"]'] }
  );
  if (allowUnauthenticated) {
    serviceNoAuth(location, projectId, service.name);
  }

  if (executionEnvironment) {
    ownServiceArgs.template['metadata']['annotations']['run.googleapis.com/execution-environment'] =
      executionEnvironment;
    if (executionEnvironment === 'gen2') {
      ownServiceArgs['metadata']['annotations']['run.googleapis.com/launch-stage'] = 'BETA';
    }
  }

  const cloudRunUrl = getCloudRunUrl(service) as any;
  const deployment: pulumi.Input<ServiceEntryDeployment> = {
    name: (serviceMod || serviceId) as any,
    endpoints: {
      authenticated: {
        url: cloudRunUrl,
        type: 'authenticated',
        audience: cloudRunUrl,
      },
    },
  };
  addServiceEntryDeployment({ deployment, type: 'cloud-run' });

  return service;
}

function addSecrets(
  serviceArgs,
  serviceId,
  secretVersion: gcp.secretmanager.SecretVersion,
  legacySecrets: boolean
) {
  const secretName = secretVersion.secret.apply((v) => v.split('/').pop());
  serviceArgs.template.spec.containers[0].volumeMounts = [
    {
      name: `${serviceId}-secret`,
      mountPath: '/etc/secrets',
    },
  ];
  serviceArgs.template.spec.volumes = [
    {
      name: `${serviceId}-secret`,
      secret: {
        secretName,
        items: [{ key: secretVersion.version, path: legacySecrets ? '.env' : 'store' }],
      },
    },
  ];
  return serviceArgs;
}

function serviceNoAuth(location, projectId, serviceName) {
  const noauthIAMPolicy = gcp.organizations.getIAMPolicy({
    bindings: [
      {
        role: 'roles/run.invoker',
        members: ['allUsers'],
      },
    ],
  });
  new gcp.cloudrun.IamPolicy('noauthIamPolicy', {
    location: location,
    project: projectId,
    service: serviceName,
    policyData: noauthIAMPolicy.then((noauthIAMPolicy) => noauthIAMPolicy.policyData),
  });
}

function addVpcConnector(
  serviceArgs,
  projectId,
  location,
  vpcConnectorName: string,
  vpcAccessEgress
) {
  serviceArgs.template.metadata.annotations['run.googleapis.com/vpc-access-egress'] =
    vpcAccessEgress || 'private-ranges-only';
  serviceArgs.template.metadata.annotations[
    'run.googleapis.com/vpc-access-connector'
  ] = pulumi.interpolate`projects/${projectId}/locations/${location}/connectors/${vpcConnectorName}`;
  return serviceArgs;
}
