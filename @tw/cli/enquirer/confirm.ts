import { exit } from 'node:process';
import { cliLog } from '../utils/logs';

const { Confirm } = require('enquirer');

export async function confirm(message?: string): Promise<void> {
  try {
    const confirm = new Confirm({ message: message || 'Are you sure?' });
    const result = await confirm.run();
    if (!result) {
      cliLog('Aborting');
      exit(0);
    }
  } catch (e) {
    exit(0);
  }
}
