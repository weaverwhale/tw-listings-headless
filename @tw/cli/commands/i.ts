import { runProcess } from '../utils/runProcess';
import { runNpmAuth } from '../utils/npmAuth';
import { getLinkedPackages } from '../utils';
import { linkPackage } from '../utils/linkPackage';
import { basename } from 'path';

async function runIWithParams(params: string[]) {
  await runNpmAuth();
  const preserve = process.argv.includes('--preserve');
  const links = [];
  const dir = params.includes('--prefix') ? params[params.indexOf('--prefix') + 1] : process.cwd();

  if (preserve) {
    links.push(...getLinkedPackages(dir));
  }
  await runProcess({
    command: 'npm',
    // TODO: temp
    commandArgs: ['i', '--progress=false', '--build-from-source', ...params],
    log: true,
  });
  if (preserve && links.length) {
    await linkPackage({
      dir,
      packages: links.map((v) => basename(v)),
    });
  }
}

export async function runIDirectory(directory = '') {
  await runIWithParams(['--prefix', directory]);
}

export async function runI() {
  await runIWithParams(process.argv.slice(3));
}
