import * as fs from 'fs';
import { resolve } from 'path';

export function loadPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(resolve('../package.json')).toString());
    return packageJson;
  } catch {
    return { name: '', version: '' };
  }
}
