import * as pulumi from '@pulumi/pulumi';

export function appendToOutput(o: pulumi.Output<string>, a: pulumi.Output<string> | string) {
  return o.apply((v) => {
    return pulumi.interpolate`${v}${v && !v.endsWith(' ') ? ' ' : ''}${a}`;
  });
}
