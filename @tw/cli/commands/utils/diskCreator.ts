import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { cliConfig } from '../../config';
import { cliError, cliSuccess } from '../../utils/logs';
import { exit } from 'process';
import { getGcloudUserEmail } from '@tw/devops';
import { cliExit } from '../../utils/exit';

export async function diskCreatorBuild(argv) {
  const client = new CloudBuildClient();
  const author = getGcloudUserEmail();
  if (!argv.prefix.startsWith('raw/')) {
    cliExit('Prefix must start with raw/');
  }
  argv.prefix = argv.prefix.replace('raw/', '');
  const [triggerRes] = await client.createBuild({
    build: {
      steps: [
        {
          name: 'gcr.io/cloud-builders/docker',
          args: [
            'run',
            '--privileged',
            '--env',
            'PREFIX=$_PREFIX',
            '--env',
            'PROJECT_ID=$PROJECT_ID',
            '--network',
            'cloudbuild',
            `us-central1-docker.pkg.dev/${cliConfig.projectId}/devops-docker/disk-creator:latest`,
          ],
        },
      ],
      options: {
        substitutionOption: 'ALLOW_LOOSE',
        diskSizeGb: '100',
        machineType: 'E2_HIGHCPU_8',
      },
      substitutions: {
        _PREFIX: argv.prefix,
        _AUTHOR: author,
      },
    },
    parent: `projects/${cliConfig.projectId}/locations/global`,
  });
  const buildUrl = triggerRes.metadata['build'].logUrl;
  cliSuccess('Logs: ' + buildUrl);
}
