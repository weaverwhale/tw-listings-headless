import { exit } from 'node:process';

import { MultiSelect, Select } from 'enquirer/lib/prompts';

export async function selectGeneric(args: {
  multi: boolean;
  message: string;
  choices: string[] | (() => Promise<string[]>);
}) {
  const { multi, message } = args;
  let { choices } = args;
  if (typeof choices === 'function') {
    choices = await choices();
  }
  const prompt = new (multi ? MultiSelect : Select)({
    name: 'value',
    message,
    choices: choices.map((v) => {
      return { name: v, value: v };
    }),
  });
  try {
    const results = await prompt.run();
    return results;
  } catch (e) {
    exit();
  }
}
