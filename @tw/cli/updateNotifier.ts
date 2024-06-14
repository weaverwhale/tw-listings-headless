import updateNotifier from 'update-notifier';
import { packageJson } from './constants';

export const notifier = updateNotifier({
  pkg: packageJson,
  updateCheckInterval: 60000,
});
