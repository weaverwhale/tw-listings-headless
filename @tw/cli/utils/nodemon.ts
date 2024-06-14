import nodemon from 'nodemon';
import { SpawnOptionsWithoutStdio } from 'child_process';
import { runProcess } from './runProcess';

export function runNodemonProcess(args: {
  command: string;
  commandArgs?: string[];
  nodemonSettings?: nodemon.Settings;
}): Promise<void> {
  const { command, commandArgs, nodemonSettings } = args;
  const promise = new Promise<void>((resolve, reject) => {
    const serviceProc = nodemon({
      exec: command,
      args: commandArgs,
      ext: 'py',
      ...nodemonSettings,
    });
    serviceProc.on('restart', () => {
      console.log('restarting due to changes...');
    });
    serviceProc.on('exit', () => {
      resolve();
    });
  });
  return promise;
}

export function spawnNodemonInTw(args: {
  name?: string;
  command: string;
  commandArgs?: string[];
  color?: string;
  additionalArgs?: SpawnOptionsWithoutStdio;
  log?: boolean;
  nodemonSettings?: nodemon.Settings;
}) {
  const { name, color, additionalArgs, log, command, commandArgs, nodemonSettings } = args;
  return runProcess({
    name,
    command: 'tw',
    commandArgs: ['cli:nodemon', JSON.stringify({ command, commandArgs, nodemonSettings })],
    additionalArgs,
    color: color,
    log: log,
  });
}

export function runNodemonFromArgv(argv) {
  const args = JSON.parse(argv._[1]);
  runNodemonProcess(args);
}
