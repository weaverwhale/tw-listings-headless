import { set } from './';

export function setConfig(argv) {
  const [key, value] = [argv.key || argv._[1], argv.value || argv._[2]];
  set(key, value);
}
