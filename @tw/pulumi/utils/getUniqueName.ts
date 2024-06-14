import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from './getConfigs';

export function getUniqueNameInProject(
  name: pulumi.Input<string> | string,
  delimiter: string = '-',
  stackFirst: boolean = false
) {
  const { isMultiPerProject, stack } = getConfigs();
  if (!name) {
    return isMultiPerProject ? stack : '';
  }
  if (typeof name === 'string') {
    return stackFirst
      ? `${isMultiPerProject ? `${stack}${delimiter}` : ''}${name}`
      : `${name}${isMultiPerProject ? `${delimiter}${stack}` : ''}`;
  }

  return pulumi.interpolate`${
    stackFirst
      ? `${isMultiPerProject ? `${stack}${delimiter}` : ''}${name}`
      : `${name}${isMultiPerProject ? `${delimiter}${stack}` : ''}`
  }`;
}
