import axios from 'axios';
import { downloadFile } from '@tw/utils/module/gcs';
import { Connection } from '@temporalio/client';
import { sleep } from '@tw/utils/module/sleep';
import { cliConfig } from '../config';
import { cliError, cliSuccess, cliWarning } from './logs';
import { selectPipelines } from '../enquirer/selectPipelines';
import { selectServices } from '../enquirer/selectServices';
import { getAllServices } from './getAllServices';
import { loadServiceConfig } from '../utils';

export async function getPipelineId(argv: any) {
  let pipelineIds: string[] = argv.services[0] || argv._.slice(1)[0];

  if (argv.select || !pipelineIds.length) {
    pipelineIds = await selectPipelines(false);
  }
  return [pipelineIds];
}

export async function getServiceIds(argv: any) {
  let serviceIds: string[] = argv.services;

  if (argv.tag) {
    serviceIds = serviceIds.concat(await getServicesFromTags(argv.tag));
    serviceIds = [...new Set(serviceIds)];
  }
  if (argv.select || !serviceIds.length) {
    serviceIds = await selectServices();
  }
  return serviceIds;
}

async function getServicesFromTags(tags): Promise<string[]> {
  if (!Array.isArray(tags)) {
    tags = [tags];
  }
  const servicesToAdd = (await getAllServices()).filter((serviceId) => {
    const serviceConf = loadServiceConfig(`${cliConfig.servicesRoot}/${serviceId}`);

    if (serviceConf.tags?.some((tag) => tags.includes(tag))) {
      return true;
    }
  });
  return servicesToAdd;
}

export async function checkEmulators(args: { projectId: string }) {
  let resourcesCreated = false;
  let times = 0;

  try {
    const res = await axios.get('http://0.0.0.0:8027/health');
    resourcesCreated = res.data.resourcesCreated;
    cliConfig.emulatorsReady = true;
    if (resourcesCreated) {
      cliSuccess('Emulators Ready!');
    }
  } catch {}
  while (!cliConfig.emulatorsReady && cliConfig.proxyPort) {
    times++;
    cliWarning('Emulators Not Ready Yet.');
    await sleep(4000);
  }

  if (!resourcesCreated) {
    type EmulatorResources = {
      topics: any[];
      subscriptions: any[];
      buckets: any[];
      queues: any[];
    };
    let resources: any;
    try {
      const stagingResources: EmulatorResources = await downloadFile(
        `devops-triple-whale-staging`,
        'emulators/cloud-resources.json',
        {
          forceCloud: true,
        }
      );
      const prodResources: EmulatorResources = await downloadFile(
        `devops-shofifi`,
        'emulators/cloud-resources.json',
        {
          forceCloud: true,
        }
      );
      resources = {
        'triple-whale-staging': stagingResources,
        shofifi: prodResources,
      };
    } catch {}
    const maxTries = 5;
    let tries = 0;
    let loadedResources = false;
    while (resources && !loadedResources && tries++ < maxTries) {
      try {
        await axios.post(`http://0.0.0.0:8027/start-emulators`, resources, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        loadedResources = true;
      } catch {
        await sleep(2000);
      }
    }
    if (!loadedResources) {
      cliError('Failed to load emulator resources');
    }
  }
}

export async function checkTemporal() {
  let times = 0;
  const connectionOptions = {
    address: '0.0.0.0:7233',
    connectTimeout: 1000,
  };
  while (!cliConfig.temporalReady) {
    try {
      await Connection.connect(connectionOptions);
      cliSuccess('Temporal Ready');
      cliConfig.temporalReady = true;
      break;
    } catch {}
    times++;
    cliWarning('Temporal Not Ready Yet.');
    await sleep(4000);
    if (times > 15) {
      break;
    }
  }
}
