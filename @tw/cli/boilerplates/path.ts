import { resolve } from 'node:path';
import * as fs from 'node:fs';
import { input } from '@inquirer/prompts';
import { TWRepo } from './types';
import { logger } from './log';
import { getRoot } from './git';

export function makeNewPath(path: string) {
  logger.info('Making new path', path, '...');
  fs.mkdirSync(path);
  return path;
}

export async function getPath(humanName: string, computerName: string, isService: boolean) {
  logger.info(`cwd is ${process.cwd()}`);
  const dir = await input({
    message: `What is the path for ${humanName}?`,
    default: getRoot(isService ? 'services' : 'packages') + '/' + computerName,
  });
  return resolve(process.cwd(), dir);
}
