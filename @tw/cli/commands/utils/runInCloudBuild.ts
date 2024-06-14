import temp from 'temp';
import { runProcess } from '../../utils/runProcess';
import * as fs from 'fs';
import { cliLog } from '../../utils/logs';
import { cliConfig } from '../../config';

function createConfigString(args: { script: string; image?: string }) {
  const {
    script,
    image = 'us-central1-docker.pkg.dev/triple-whale-staging/devops-docker/pulumi-kubectl:latest',
  } = args;
  return `
steps:
  - name: ${image}
    script: >
      ${script}
options:
  substitution_option: 'ALLOW_LOOSE'
`;
}

export async function runInCloudBuild(argv) {
  const configFile = temp.path({ suffix: '.yaml' });
  cliLog(`File: ${configFile}`);
  fs.writeFileSync(configFile, createConfigString({ script: argv.script }));
  return runProcess({
    log: true,
    name: '',
    command: 'gcloud',
    commandArgs: [
      'builds',
      'submit',
      `--config=${configFile}`,
      `--project=${cliConfig.projectId}`,
      '--no-source',
    ],
  });
}
