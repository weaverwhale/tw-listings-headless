import { cliError } from './logs';

export function cliExit(msg?: string): never {
  if (msg) cliError(msg);
  process.exit(1);
}
