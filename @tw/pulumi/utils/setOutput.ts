import { isLocal } from '../constants';

export const localExports: Record<string, any> = {};

export function setOutput(key: string, value: any) {
  if (isLocal) return;
  localExports[key] = value;
  require(process.env.PWD + '/index')[key] = value;
}
