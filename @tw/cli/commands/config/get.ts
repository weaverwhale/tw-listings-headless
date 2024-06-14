import { get } from './';

export function getConfig(argv) {
  const key = argv.key || argv._[1];
  console.log(get(key));
}
