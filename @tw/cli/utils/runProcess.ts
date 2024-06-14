import { SpawnOptions } from 'node:child_process';
import { runCommand } from '@tw/utils/module/os';
import { serviceLogStream } from '../utils';

export function runProcess(args: {
  name?: string;
  command: string;
  commandArgs?: string[];
  color?: string;
  additionalArgs?: SpawnOptions;
  log?: boolean;
}): Promise<{ stdout: string; stderr: string }> {
  const { name, command, commandArgs, color, additionalArgs, log } = args;
  let onData;
  let onClose;
  if (log) {
    onData = (data) => serviceLogStream(data, name, color);
    onClose = (code) => serviceLogStream(`finished with code: ${code}`, name, color);
  }
  return runCommand({ command, commandArgs, additionalArgs, log, onData, onClose });
}
