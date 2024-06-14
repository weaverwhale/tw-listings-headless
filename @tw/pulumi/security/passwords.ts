import * as qs from 'node:querystring';
import { RandomPassword } from '@pulumi/random';
import { getConfigs } from '../utils';

export function createPassword(args: {
  name: string;
  special?: boolean;
  overrideSpecial?: string;
}) {
  const { name, special = true, overrideSpecial = `!#%&*()-_=+[]{}<>:?` } = args;
  const { config } = getConfigs();
  const password = new RandomPassword(name, {
    length: 16,
    special,
    overrideSpecial,
    keepers: { rotate: config.get('rotatePassword') || 'false' },
  });
  return password;
}

export function urlEscapePassword(password: RandomPassword) {
  return password.result.apply((result) => qs.escape(result));
}
