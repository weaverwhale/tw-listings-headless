import { runProcess } from './runProcess';
import moment from 'moment';
import os from 'os';
import { cliError, cliLog } from './logs';
import { configStore } from './configstore';

export const globalNpmrcFile = `${os.homedir()}/.npmrc`;

export async function runNpmAuth(argv?) {
  const force = argv?.f;
  const expire = moment(configStore.get('npmAuth') || new Date());
  const now = moment();
  if (expire <= now.add(10, 'minutes') || force) {
    try {
      await runProcess({
        name: 'general',
        command: 'npx',
        commandArgs: ['google-artifactregistry-auth', '--repo-config', globalNpmrcFile],
        color: 'FA910D',
        log: true,
      });
      configStore.set('npmAuth', now.add(1, 'hours'));
    } catch (e) {
      await runProcess({
        command: 'npm',
        commandArgs: [
          'config',
          'set',
          '@tw:registry',
          'https://us-central1-npm.pkg.dev/shofifi/npm-packages/',
        ],
      }).catch(console.error);
      cliError('Failed to refresh auth, please trying again.');
      await runNpmAuth(argv);
    }
  } else {
    cliLog('No need to refresh auth.');
  }
}
