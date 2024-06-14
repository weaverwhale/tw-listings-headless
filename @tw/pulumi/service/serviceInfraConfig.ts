import * as gcp from '@pulumi/gcp';
import fs from 'fs';
import { uploadAPIConfig } from '../api-gateway';
import { createBuildTrigger } from '../cloud-build';
import { createDefaultServiceDashboards } from '../monitoring/defaultDashboards';
import { CreateBuildTriggerArgs } from '../cloud-build/types';
import { serviceTarget } from '../types';
import { k8sClusters } from '../k8s';
import { updateServiceEntry } from './serviceEntry';
import { createDatadogService } from '../datadog';
import { createDefaultDatadogDashboard } from '../datadog/dashboards';
import { createDefaultDatadogMonitors } from '../datadog/monitors';
import { getConfigs, serviceConfigFile } from '../utils';
import { loadServiceConfig } from './loadServiceConfig';
import { isProduction } from '../constants';
import { objectBool } from '../utils/bool';

const openApiFile = '../openapi.yml';
export let deployedToK8s = false;

export function serviceInfraConfig(
  args: {
    apiGateway?: { service: serviceTarget; removePrefix?: boolean };
    cloudBuild?: Partial<CreateBuildTriggerArgs>;
    isK8s?: boolean;
    alerts?: { excludePubsubSubs: gcp.pubsub.Subscription[] };
  } = {}
) {
  const { apiGateway, cloudBuild = {}, isK8s, alerts } = args;
  const { isMultiPerProject } = getConfigs();
  if (!fs.existsSync(serviceConfigFile)) return;
  const serviceConfig = loadServiceConfig();

  if (!cloudBuild?.k8s?.clusters && objectBool(k8sClusters)) {
    if (!cloudBuild?.k8s) cloudBuild.k8s = {};
    cloudBuild.k8s.clusters = Object.values(k8sClusters).map(({ name, location }) => {
      return { name, location: location };
    });
  }

  if (objectBool(k8sClusters)) {
    deployedToK8s = true;
  }

  if (cloudBuild.k8s?.clusters && !cloudBuild.workerPool) {
    cloudBuild.workerPool = 'app-pool';
    if (cloudBuild.machineType) {
      cloudBuild.workerPool = `${cloudBuild.workerPool}-${cloudBuild.machineType
        .toLowerCase()
        .replaceAll('_', '-')}`;
    }
  }

  // api config
  if (apiGateway?.service && fs.existsSync(openApiFile)) {
    uploadAPIConfig(openApiFile, apiGateway.service, {
      removePrefix: apiGateway?.removePrefix,
    });
  }

  // cloud build
  createBuildTrigger({ runtime: serviceConfig.runtime || 'node', ...cloudBuild });

  // dashboard
  createDefaultServiceDashboards();

  // upload serviceEntry
  updateServiceEntry({ serviceConfig, isK8s, cloudBuild });

  if (isProduction) {
    const datadogDashboard = createDefaultDatadogDashboard();

    createDefaultDatadogMonitors({
      datadogDashboard,
      excludePubsubSubs: alerts?.excludePubsubSubs,
    });

    createDatadogService({ serviceConfig, datadogDashboard });
  }
}
