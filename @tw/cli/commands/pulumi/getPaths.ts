import * as path from 'node:path';
import { getGitRoot } from '../../utils/fs';
import { selectPulumiProjects } from '../../enquirer/selectPulumiProjects';
import { cliError } from '../../utils/logs';
import { cliExit } from '../../utils/exit';

export async function getPulumiPaths(argv) {
  const gitRoot = await getGitRoot();

  // if user passes paths as param, treat as relative to working dir
  let dirs: string[] = argv.dirs || argv._.slice(1);
  let dirsAbsolute = dirs.map((dir) => path.resolve(dir));

  // if user selects paths from list, treat as relative to git root
  if (!dirsAbsolute.length) {
    dirs = await selectPulumiProjects();
    dirsAbsolute = dirs.map((dir) => path.resolve(gitRoot, dir));
  }
  if (!dirsAbsolute) {
    cliExit('No pulumi projects selected');
  }
  return { gitRoot, dirsAbsolute };
}
