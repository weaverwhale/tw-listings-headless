import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger } from './log';
import { replace } from './replace';
import type { TWRepo } from './types';
import { DIRNAME } from './config';

export function copyFiles(info: TWRepo) {
  logger.info('Copying files from template', '...');
  const source = path.resolve(DIRNAME, 'templates', info.templateDir);
  const destination = info.path;
  fs.cpSync(source, destination, { recursive: true, force: true, verbatimSymlinks: true });
  replaceInFiles(info, destination);
}

export function replaceInFiles(info: TWRepo, destination: string) {
  for (let file of fs.readdirSync(destination)) {
    const filepath = path.join(destination, file);
    if (fs.statSync(filepath).isDirectory()) {
      replaceInFiles(info, filepath);
      continue;
    }
    const string = fs.readFileSync(filepath).toString();
    const newString = replace(string, info);
    fs.writeFileSync(filepath, newString);
  }
}
