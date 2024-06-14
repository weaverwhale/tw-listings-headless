import * as fs from 'fs';
import { runProcess } from '../../utils/runProcess';
import { getSecrets, getUserEnv, loadServiceConfig } from '../../utils';
import { handleDockerDeps } from '../../utils/dockerDeps';
import { ServiceData } from '../../types';
import { runPythonService } from './up';
import { cliConfig } from '../../config';
import { getEnvs } from '../../utils/env';

let pythonVersion;

export async function runCommand(argv: any) {
  let [serviceId, file] = [argv.service, argv.file];
  if (!serviceId || !file) [serviceId, file] = argv._.slice(1);
  pythonVersion = argv.p3 ? '3' : '';

  let serviceDir = `${cliConfig.servicesRoot}/${serviceId}`;
  if (!fs.existsSync(serviceDir)) {
    // path passed
    serviceDir = serviceId;
    serviceId = serviceId.split('/').pop() as any;
  }

  const serviceConfig = loadServiceConfig(serviceDir);

  const secrets = { TW_SECRETS: await getSecrets(serviceId) };
  const userEnv = getUserEnv(serviceDir);

  handleDockerDeps(serviceConfig.dependencies, argv.debug);

  const serviceData = {
    id: serviceId,
    secrets,
    config: serviceConfig,
    serviceDir,
    userEnv,
  };

  await runService(serviceData as any, file);
}

async function runService(serviceData: ServiceData, file) {
  if (serviceData.config.runtime === 'python') {
    await runPythonService({ serviceData, file });
  } else {
    await runNodeService(serviceData, file);
  }
}

async function runNodeService(serviceData: ServiceData, file) {
  const serviceId = serviceData.id;

  await runProcess({
    name: serviceId,
    command: 'node',
    commandArgs: [file],
    additionalArgs: {
      cwd: serviceData.serviceDir,
      env: {
        ...getEnvs(),
        ...serviceData.config.env,
        ...serviceData.secrets,
        ...serviceData.userEnv,
      },
    },
    color: serviceData.config.color,
    log: true,
  });
}
