import { checkbox } from '@inquirer/prompts';

export async function getDockerDeps(): Promise<string[]> {
  return await checkbox({
    message: 'Select docker dependencies',
    choices: ['emulators', 'redis', 'postgres', 'mongo', 'temporal'].map((dep) => ({
      name: dep,
      value: dep,
    })),
  });
}
