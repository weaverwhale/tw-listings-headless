import { rawlist } from '@inquirer/prompts';
import { bases } from './config';
import { TWBase } from './types';

export async function getBase(): Promise<TWBase> {
  const base = await rawlist({
    message: 'Pick a template',
    choices: bases.map((base) => ({ value: base.id, name: base.name })),
  });
  const info = bases.find((b) => b.id === base);
  if (!info) {
    throw new Error('Invalid base');
  }
  return info;
}
