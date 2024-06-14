import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { TWRepo } from './types';
import { logger } from './log';

export function getRoot(dirName: string) {
  const pathRelativeToGit = execSync(['git', 'rev-parse', '--show-prefix'].join(' '))
    .toString()
    .trim();

  if (!pathRelativeToGit && process.cwd().split('/').pop() === dirName) {
    return process.cwd();
  }

  const relPath: string = pathRelativeToGit
    .split('/')
    .filter(Boolean)
    .map((_) => '../')
    .join('');

  const rootPath = path.resolve(relPath, dirName);
  const parts = rootPath.split('/');
  if (parts.pop() === parts.pop()) {
    return path.resolve(rootPath.split('/').slice(0, -1).join('/'));
  }

  return rootPath;
}
