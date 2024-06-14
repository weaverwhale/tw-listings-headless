import { selectServices } from '../enquirer/selectServices';
import { triggerCloudBuilds } from '../utils/cloudBuild';
import { getServiceInfo } from '../utils/fs';
import { runDeployPipeline } from './deployPipeline';
import { runNpmTest } from '../utils/runNpmTest';
import { cliExit } from '../utils/exit';

export async function runDeploy(argv) {
  const envs = [];
  if (argv.beam) {
    return await runDeployPipeline(argv);
  }
  if (argv.debug) {
    envs.push('LOG_LEVEL=debug');
  } else if (argv.trace) {
    envs.push('LOG_LEVEL=trace');
  }
  if (argv.force) {
    envs.push('F=true');
  }
  let serviceIds: string[] = argv.services || argv._.slice(1);
  const substitutions = {};
  if (argv.select || !serviceIds.length) {
    serviceIds = await selectServices();
  }
  if (!serviceIds) {
    cliExit('No services selected');
  }

  const services = await Promise.all(serviceIds.map((s) => getServiceInfo(s)));

  if (argv.unitTests) {
    await Promise.all(
      services
        .filter((s) => s.runtime === 'node')
        .map((s) => runNpmTest({ name: s.serviceName, absolutePath: s.absolutePath }, argv))
    );
  }

  await triggerCloudBuilds({
    argv,
    buildNames: services.map((s) => getBuildNameForService(s.serviceName)),
    substitutions,
    dirs: services.map((s) => s.absolutePath + '/infra'),
    envs,
  });
}

function getBuildNameForService(serviceId: string) {
  return `${serviceId}-service`;
}
