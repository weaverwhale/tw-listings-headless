import { exit } from 'process';
import { execCompose, IDockerComposeOptions } from 'docker-compose/dist/v2';
import { serviceLogStream } from '../utils';
import { cliLog, cliError } from './logs';
import fs from 'fs';
import os from 'os';
import { dockers } from '../docker/dockers';
import { getEnvs } from './env';
import { cliExit } from './exit';

export async function handleDockerDeps(serviceDependencies: string[], debug: string[] = []) {
  ensureDockerAuth();
  for (const dep of serviceDependencies) {
    const depConf = dockers[dep];
    if (!depConf) {
      cliExit(`Invalid dependency: ${dep}, try updating the cli.`);
    }
    const conf = depConf.config(process.env.PROJECT_ID);
    const dockerOptions: IDockerComposeOptions = {
      env: { ...getEnvs() },
      configAsString: conf,
      callback: (chunk, _) => {
        serviceLogStream(chunk, dep + ' (docker)', depConf.color || '42db27');
      },
      composeOptions: ['-p', 'tw-cli'],
    };
    try {
      if (depConf.keepFresh) {
        await execCompose('pull', [], dockerOptions);
      }
      cliLog(`starting ${dep}`);
      if (!debug.includes(dep)) delete dockerOptions.callback;
      execCompose(
        'up',
        ['--no-log-prefix', ...(depConf.detach ? ['-d'] : [])],
        dockerOptions
      ).catch((e) => {
        cliExit(e.err);
      });
    } catch (e) {
      cliExit(e.err);
    }
  }
}

function ensureDockerAuth() {
  const path = `${os.homedir()}/.docker/config.json`;
  const config = JSON.parse(fs.readFileSync(path).toString());
  if (!config.credHelpers?.['us-central1-docker.pkg.dev']) {
    if (!config.credHelpers) config.credHelpers = {};
    config.credHelpers['us-central1-docker.pkg.dev'] = 'gcloud';
    fs.writeFileSync(path, JSON.stringify(config, null, 2));
  }
}
