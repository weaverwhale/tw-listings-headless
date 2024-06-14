import { confirm, input } from '@inquirer/prompts';

export async function getMaintainers(): Promise<string[]> {
  const maintainers = (
    await input({
      message: `Who are the maintainers (Space-separated @triplewhale.com usernames)?`,
    })
  ).split(/\s+/);

  return maintainers.map((maintainer) => {
    if (maintainer.endsWith('@triplewhale.com')) {
      return maintainer.trim();
    }
    return maintainer.trim() + '@triplewhale.com';
  });
}

async function getMaintainer(first?: boolean) {}
