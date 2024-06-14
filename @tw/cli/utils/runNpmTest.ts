import { spawn } from 'node:child_process';
import { loadServiceConfig } from '../utils';

export async function runNpmTest(
  args: {
    name: string;
    absolutePath: string;
  },
  argv: any
) {
  const { name, absolutePath } = args;

  let serviceEnv = {};
  try {
    const serviceConfig = loadServiceConfig(absolutePath);
    serviceEnv = serviceConfig.env || {};
  } catch (e) {}

  return new Promise<void>((resolve, reject) => {
    const proc = spawn(
      'npm',
      ['test', '--if-present', '--prefix', absolutePath, '--', '--silent'],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          ...serviceEnv,
        },
      }
    );

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tests for ${args.name} failed`));
      }
    });
  });
}
