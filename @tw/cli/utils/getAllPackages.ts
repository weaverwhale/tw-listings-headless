import * as fs from 'fs';
import { cliConfig } from '../config';

export async function getAllPackages() {
  const packagesRoot = cliConfig.packagesRoot;
  return fs
    .readdirSync(packagesRoot)
    .filter((folder) => fs.existsSync(`${packagesRoot}/${folder}/package.json`));
}
