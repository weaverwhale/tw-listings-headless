import * as pulumi from '@pulumi/pulumi';

export function dataflowParametersToCMDArgs(parameters: Record<string, pulumi.Input<string>>) {
  const parametersString = pulumi
    .all(
      Object.entries(parameters || {}).map(([key, value]) => pulumi.interpolate`--${key}=${value}`)
    )
    .apply((v) => v.join(' '));
  return parametersString;
}
