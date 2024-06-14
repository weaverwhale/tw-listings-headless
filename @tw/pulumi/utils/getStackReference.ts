import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from './getConfigs';
import { isLocal } from '../constants';

let stacks = {};

export function getStackReference(
  pulumiProject: string,
  stackName?: string
): pulumi.StackReference {
  if (isLocal) {
    return {
      // @ts-ignore
      getOutput: () => '',
    };
  }
  // allows for calling multiple times in one stack
  const stackId = `triplewhale/${pulumiProject}/${stackName || getConfigs().stack}`;
  if (!stacks[stackId]) stacks[stackId] = new pulumi.StackReference(stackId);
  return stacks[stackId];
}
