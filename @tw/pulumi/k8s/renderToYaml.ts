import fs from 'fs';
import * as pulumi from '@pulumi/pulumi';
import { toYamlOutput } from '../pulumi-utils';
import { K8sProvider } from './provider';

export function renderToYaml(args: pulumi.ResourceTransformationArgs) {
  if (!process.env.IS_CLOUD_BUILD) return;
  const { props, opts, name } = args;
  const provider = opts?.provider as K8sProvider;
  // its a get
  if (!props.kind) return;
  if (!props.metadata) props.metadata = {};
  const filename = `${props.apiVersion}-${props.kind}-${props.metadata.name || name}.yaml`
    .replace('/', '-')
    .toLowerCase();
  const dir = './.yaml';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!props.metadata?.namespace) {
    props.metadata.namespace = provider.namespace;
  }
  toYamlOutput(props).apply((o) => {
    fs.writeFileSync(`${dir}/${filename}`, o);
  });
}
