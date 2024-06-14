import { confirm, input } from '@inquirer/prompts';

export async function getTags(): Promise<string[]> {
  return (
    await input({
      message: 'Add tags (separate tags by space like `tag-a tag-b`)?',
    })
  )
    .split('s+')
    .map((t) => t.trim());
}
