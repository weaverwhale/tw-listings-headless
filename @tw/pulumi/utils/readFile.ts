import * as fs from 'fs';

export function readFile(path: string) {
  try {
    return fs.readFileSync(path);
  } catch {
    return Buffer.from('');
  }
}
