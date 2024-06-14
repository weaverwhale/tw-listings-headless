import { input } from '@inquirer/prompts';
import { TWBase, TWTsRepo } from './types';

export async function getNames(
  info: TWBase
): Promise<{ humanName: string; computerName: string; providerId?: string }> {
  let humanName = await input({
    message:
      `What is the name of the ${info.isService ? 'service' : 'package'}?` +
      '\n\t(use a human name, e.g. "Google Ads" or "Test Utils")',
  });

  if (!humanName) {
    console.log('You must provide a name!');
    return await getNames(info);
  }

  let computerName = humanName.toLowerCase().replace(/\s+/g, '-');
  if (humanName.startsWith('@tw/') || humanName.match(/^[a-z-]+$/)) {
    computerName = humanName;
    humanName = humanName
      .replace('@tw/', '')
      .replace('-', ' ')
      .replace(/\b(\w)/g, (s) => s.toUpperCase());
  }

  return {
    humanName,
    computerName,
  };
}

export async function getSensoryFetcherName(info: TWBase): Promise<{
  providerId: string;
  humanName: string;
  computerName: string;
}> {
  let providerId = await input({
    message: `What is the provider id for the fetcher?`,
  });
  if (!providerId) {
    console.log('You must provide a provider id!');
    return await getSensoryFetcherName(info);
  }
  return {
    providerId,
    humanName:
      providerId.replace(/-/g, ' ').replace(/\b(\w)/g, (s) => s.toUpperCase()) + ' Fetcher',
    computerName: providerId + '-fetcher',
  };
}
