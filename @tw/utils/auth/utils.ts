import { AuthType } from '@tw/types';

export function getAuthType(user): AuthType {
  if (user.firebase) return 'user';
  return 'app';
}
