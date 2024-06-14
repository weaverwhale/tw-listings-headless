import { execSync } from 'node:child_process';
import { npmInstall } from './npmInstall';
import { logger } from './log';
import type { TWRepo, TWPythonRepo, TWTsRepo } from './types';

export function install(info: TWRepo) {
  switch (info.language) {
    case 'ts':
      installNode(info);
      break;
    case 'python':
      installPython(info);
      break;
  }
}

function installNode(info: TWTsRepo) {
  const { dependencies, devDependencies, path } = info;
  logger.info('Installing dependencies', '...');
  npmInstall(path, dependencies || [], devDependencies);
}

function installPython(info: TWPythonRepo) {
  try {
    logger.info('Making virtual environment', '...');
    execSync(['tw', 'python:init-env'].join(' '), { cwd: info.path });
    logger.info('Installing requirements', '...');
    execSync(
      [
        'source',
        'venv/bin/activate',
        '&&',
        'pip',
        'install',
        '--index-url=https://us-python.pkg.dev/shofifi/python-virtual/simple',
        '-r',
        'requirements.txt',
      ].join(' '),
      { cwd: info.path }
    );
  } catch (e: any) {
    e.message = `Couldn't create python virtual environment: ${e.message}`;
    throw e;
  }
}
