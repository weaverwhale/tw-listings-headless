import * as fs from 'node:fs';
import { input, select, confirm } from '@inquirer/prompts';
import { getBase } from './getBase';
import { getDockerDeps } from './getDockerDeps';
import { getMaintainers } from './getMaintainers';
import { getNames } from './getName';
import { getTags } from './getTags';
import { makeInfra } from './makeInfra';
import { getPath, makeNewPath } from './path';
import { makePythonDefaults } from './makePythonDefaults';
import { makeTWConfig } from './makeTWConfig';
import { makeTypescriptDefaults } from './makeTypescriptDefaults';
import { pickColor } from './pickColor';
import { logger } from './log';
import { copyFiles } from './copyFiles';
import { install } from './install';
import { getCurrentBranch } from '../utils/git';
import type { TWBase, TWPythonRepo, TWRepo, TWTsRepo } from './types';
import { notifier } from '../updateNotifier';
import { runNpmAuth } from '../utils/npmAuth';
import { cliExit } from '../utils/exit';

export async function initTW() {
  await runNpmAuth();
  const { current, latest } = await notifier.fetchInfo();
  if (current !== latest) {
    cliExit('Please update @tw/cli to latest version to continue.');
  }

  const branch = await getCurrentBranch();
  const base: TWBase = await getBase();
  let { providerId, humanName, computerName } = base.getNames
    ? await base.getNames(base)
    : await getNames(base);
  const color = await pickColor(humanName, logger);
  const path = await getPath(humanName, computerName, base.isService);
  const dirName = path.split('/').pop();
  if (dirName && dirName !== computerName) {
    computerName = dirName;
  }
  const maintainers = await getMaintainers();
  let dockerDeps: string[] | undefined = undefined;
  let tags: string[] | undefined = undefined;

  if (base.isService) {
    dockerDeps = await getDockerDeps();
    tags = await getTags();
  }

  const info: TWRepo = {
    ...base,
    ...(base.isFetcher && { providerId }),
    color,
    humanName,
    computerName,
    path,
    maintainers,
  };

  if (!!dockerDeps) {
    info.dockerDeps = [...dockerDeps];
  }
  if (!!tags) {
    info.tags = [...tags];
  }

  makeNewPath(info.path);
  try {
    makeLanguageDefaults(info);
    copyFiles(info);
    install(info);
    if (info.isService) {
      makeTWConfig(info);
      makeInfra(info);
    }
  } catch (e: any) {
    e.message = `Couldn't create ${info.computerName} repo: ${e.message}`;
    try {
      fs.rmSync(info.path, { recursive: true, force: true });
    } catch (_e: any) {
      logger.error(`Couldn't remove ${info.path}: ${_e.message}`);
    }
    throw e;
  }
}

function makeLanguageDefaults(info: TWRepo) {
  switch (info.language) {
    case 'ts':
      makeTypescriptDefaults(info as TWTsRepo);
      break;
    case 'python':
      makePythonDefaults(info as TWPythonRepo);
      break;
  }
}
