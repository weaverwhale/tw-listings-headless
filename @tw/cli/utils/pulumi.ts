import fs from 'fs';
import yaml from 'yaml';
import { exit } from 'node:process';
import { projectIds } from '@tw/constants';
const { MultiSelect, Select } = require('enquirer');

export const STACK_PROJECT_KEY = 'gcp:project';

export function getPulumiStacks(dirs: string[]): Record<string, any> {
  const result = {};
  if (!dirs?.length) {
    for (const projectId of projectIds) {
      result[projectId] = { config: { [STACK_PROJECT_KEY]: projectId } };
    }
    return result;
  }
  const allStacks = [];
  for (const dir of dirs) {
    const stackFileNames = fs
      .readdirSync(dir)
      .filter((v) => v.endsWith('.yaml') && v.startsWith('Pulumi.') && v !== 'Pulumi.yaml');
    allStacks.push(...stackFileNames);
  }
  const stackFileNames = [...new Set(allStacks)].filter(
    (v) => allStacks.filter((a) => a === v).length === dirs.length
  );
  for (const stackFileName of stackFileNames) {
    const stackName = stackFileName.split('.')[1];
    result[stackName] = yaml.parse(fs.readFileSync(`${dirs[0]}/${stackFileName}`).toString());
  }
  return result;
}

export async function selectStacks(stacks: string[]) {
  const stacksPrompt = new MultiSelect({
    name: 'value',
    message: 'Choose the Stacks',
    choices: stacks.map((projectId) => {
      return { name: projectId, value: projectId };
    }),
  });
  try {
    const stacksRes = await stacksPrompt.run();
    return stacksRes;
  } catch (e) {
    exit();
  }
}

export async function selectStack(stacks: string[]) {
  const stacksPrompt = new Select({
    name: 'value',
    message: 'Choose the Stack',
    choices: stacks.map((projectId) => {
      return { name: projectId, value: projectId };
    }),
  });
  try {
    const stacksRes = await stacksPrompt.run();
    return stacksRes;
  } catch (e) {
    exit();
  }
}

export async function loadPulumiProject(dir: string): Promise<{
  name: string;
  runtime: 'nodejs';
  description: string;
}> {
  const yamlContents = yaml.parse(fs.readFileSync(`${dir}/Pulumi.yaml`).toString());
  return yamlContents;
}
