import { exit } from 'node:process';
import { triggerCloudBuilds } from '../utils/cloudBuild';
import { cliError } from '../utils/logs';
import { selectPipelines } from '../enquirer/selectPipelines';
import { getServiceInfo } from '../utils/fs';
import { cliExit } from '../utils/exit';

export async function runDeployPipeline(argv) {
  let pipelineIds: string[] = argv.services || argv._.slice(1);

  const services = await Promise.all(pipelineIds.map(async (s) => await getServiceInfo(s, true)));

  if (argv.select || !pipelineIds.length) {
    pipelineIds = await selectPipelines();
  }
  if (!pipelineIds) {
    cliExit('No pipelines selected');
  }

  const substitutions = {};

  await triggerCloudBuilds({
    argv,
    buildNames: services.map((service) => getBuildNameForPipeline(service.serviceName)),
    substitutions,
    dirs: services.map((s) => s.absolutePath + '/infra'),
  });
}

function getBuildNameForPipeline(pipelineId: string) {
  return pipelineId;
}
