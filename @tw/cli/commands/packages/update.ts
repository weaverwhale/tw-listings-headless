import { resolve } from 'path';
import { cliConfig } from '../../config';
import { selectPackages } from '../../enquirer/selectPackages';
import { selectServices } from '../../enquirer/selectServices';
import { runProcess } from '../../utils/runProcess';
import { runNpmAuth } from '../../utils/npmAuth';
import { selectPulumiProjects } from '../../enquirer/selectPulumiProjects';

export async function updateCommand(argv) {
  const packages = argv.packages?.length ? argv.packages : await selectPackages();
  const dirs = argv.pulumi
    ? await selectPulumiProjects()
    : (await selectServices()).map((service) => `services/${service}`);

  for (const relativeDir of dirs) {
    let serviceDir = `${cliConfig.gitRoot}/${relativeDir}`;
    await runProcess({
      name: relativeDir,
      command: 'tw',
      commandArgs: ['i', ...packages.map((pkg) => '@tw/' + pkg + '@latest')],
      additionalArgs: { cwd: resolve(serviceDir) },
      log: true,
    });
  }
}
