import { spawn, SpawnOptions } from 'node:child_process';

export function runCommand(args: {
  command: string;
  commandArgs?: string[];
  additionalArgs?: SpawnOptions;
  log?: boolean;
  onData?: (data: string) => void;
  onClose?: (code: number) => void;
}): Promise<{ stdout: string; stderr: string }> {
  const { command, commandArgs, additionalArgs, log, onData, onClose } = args;
  const promise = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    let result = { stdout: '', stderr: '' };
    const stdioInherit = additionalArgs?.stdio?.includes('inherit');
    const serviceProc = spawn(command, commandArgs, {
      shell: process.platform == 'win32',
      ...additionalArgs,
    });

    if (!stdioInherit) {
      serviceProc.stdout.on('data', (data) => {
        const str = data.toString();
        if (onData) onData(str);
        result.stdout += str;
      });

      serviceProc.stderr.on('data', (data) => {
        const str = data.toString();
        if (onData) onData(str);
        result.stderr += str;
      });

      serviceProc.on('close', (code) => {
        if (onClose) onClose(code);
        if (code !== 0 && result.stderr) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    }
  });
  return promise;
}
