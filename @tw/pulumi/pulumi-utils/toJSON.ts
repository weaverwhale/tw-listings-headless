import * as pulumi from '@pulumi/pulumi';
import yaml from 'yaml';

export function toJSONOutput(value: Record<string, pulumi.Input<any>>, pretty = false) {
  return pulumi.output(value).apply((o) => JSON.stringify(o, undefined, pretty ? 2 : undefined));
}

export function toYamlOutput(value: Record<string, pulumi.Input<any>>) {
  return pulumi.output(value).apply((o) => yaml.stringify(o));
}

export function toBase64Output(value: pulumi.Output<string>) {
  return value.apply((v) => Buffer.from(v).toString('base64'));
}

export function fromBase64(value: pulumi.Input<string>) {
  return pulumi.output(value).apply((v) => Buffer.from(v, 'base64').toString('ascii'));
}
