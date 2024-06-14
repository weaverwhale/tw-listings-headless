import { TWRepo } from './types';

export function replace(string: string, info: TWRepo) {
  return string
    .replace(/\$SERVICE_ID/g, info.computerName)
    .replace(/\$SERVICE_NAME/g, info.humanName)
    .replace(/\$COLOR/g, info.color)
    .replace(/\$PACKAGE_NAME/g, '@tw/' + info.computerName)
    .replace(/\$PROVIDER_ID/g, info.providerId || '');
}
