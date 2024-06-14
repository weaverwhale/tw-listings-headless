import path from 'path';
import { runProcess } from './runProcess';

export const packagesGitUrl = 'git@github.com:Triple-Whale/backend-packages.git';
export const fetchersPackagesGitUrl = 'git@github.com:TripleWhaleKamatech/triplewhale-fetchers.git';

export async function getCurrentBranch() {
  const branch = (
    await runProcess({
      log: false,
      command: 'git',
      commandArgs: ['rev-parse', '--abbrev-ref', 'HEAD'],
    })
  ).stdout.trim();
  return branch;
}

export async function getPathRelativeToGit() {
  const path = (
    await runProcess({
      log: false,
      command: 'git',
      commandArgs: ['rev-parse', '--show-prefix'],
    })
  ).stdout.trim();
  return path;
}

export async function gitPull() {
  await runProcess({
    log: false,
    command: 'git',
    commandArgs: ['pull'],
  });
}

export async function getRepoName() {
  const repoDir = (
    await runProcess({
      log: false,
      command: 'git',
      commandArgs: ['rev-parse', '--show-toplevel'],
    })
  ).stdout.trim();
  return path.basename(repoDir);
}
