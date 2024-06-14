import { resolve } from 'path';
import { cliConfig } from '../config';

import { runProcess } from './runProcess';
import { cliLog } from './logs';

export async function linkPackage(args: {
  packages: string[];
  dir: string;
  color?: string;
  force?: boolean;
}) {
  const { packages, dir, force, color } = args;

  const globalLinks = await getGlobalLinks();
  for (const packageName of packages) {
    if (!globalLinks.includes(`@tw/${packageName}`)) {
      await createGlobalLink(packageName);
    }
  }
  const commandArgs = ['link', ...packages.map((pack) => '@tw/' + pack)];
  if (force) commandArgs.push('-f');
  await runProcess({
    command: 'npm',
    commandArgs,
    color: color,
    additionalArgs: { cwd: resolve(dir) },
    log: true,
  });
}

async function getGlobalLinks() {
  const globalLinks = JSON.parse(
    (await runProcess({ command: 'npm', commandArgs: ['ls', '-g', '--json'] })).stdout
  );
  return Object.keys(globalLinks.dependencies);
}

async function createGlobalLink(packageName) {
  cliLog(`There's no global link for package ${packageName}, please enter your password if asked.`);

  await runProcess({
    name: 'global',
    command: 'sudo',
    commandArgs: ['npm', 'link'],
    additionalArgs: { cwd: resolve(`${cliConfig.packagesRoot}/${packageName}`) },
    log: true,
  });
}
