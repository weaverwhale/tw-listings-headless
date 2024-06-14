import { cliConfig } from '../../config';
import { selectPackages } from '../../enquirer/selectPackages';

import { selectServices } from '../../enquirer/selectServices';
import { getServicesRoot } from '../../utils/fs';
import { linkPackage } from '../../utils/linkPackage';
import { runNpmAuth } from '../../utils/npmAuth';

export async function linkCommand(argv) {
  const packages = argv.packages || (await selectPackages());
  const services = argv.services || (await selectServices());
  await runNpmAuth();
  for (const serviceId of services) {
    let serviceDir = `${cliConfig.servicesRoot}/${serviceId}`;
    if (argv.infra) serviceDir += '/infra';
    await linkPackage({ packages, dir: serviceDir });
  }
}

export async function linkClientCommand(argv) {
  const packages = argv.packages || (await selectPackages());
  await runNpmAuth();
  await linkPackage({
    packages,
    dir: cliConfig.clientRoot,
    force: true,
  });
}

export async function unlinkCommand(argv) {
  const packages = argv.packages || (await selectPackages());
  const services = argv.services || (await selectServices());
  for (const serviceId of services) {
    let serviceDir = `${cliConfig.servicesRoot}/${serviceId}`;
    if (argv.infra) serviceDir += '/infra';
    await linkPackage({ packages, dir: serviceDir });
  }
  await runNpmAuth();
}
