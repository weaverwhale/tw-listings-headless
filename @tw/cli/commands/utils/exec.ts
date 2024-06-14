import * as fs from 'fs';
import { resolve } from 'path';
import { cliConfig } from '../../config';
import { selectServices } from '../../enquirer/selectServices';
import { runProcess } from '../../utils/runProcess';
import { runNpmAuth } from '../../utils/npmAuth';

export async function execForServices(argv) {
  const command = argv.cmd || argv._.slice(1);
  let services = fs.readdirSync(cliConfig.servicesRoot);
  if (argv.select) {
    const servicesFilter = await selectServices();
    services = services.filter((s) => servicesFilter.includes(s));
  }
  await runNpmAuth();
  for (const serviceId of services) {
    let serviceDir = `${cliConfig.servicesRoot}/${serviceId}`;
    if (argv.infra) serviceDir += '/infra';
    await runProcess({
      name: serviceId,
      command: process.env.SHELL || 'bash',
      commandArgs: ['-c', command],
      additionalArgs: { cwd: resolve(serviceDir) },
      log: true,
    });
  }
}
