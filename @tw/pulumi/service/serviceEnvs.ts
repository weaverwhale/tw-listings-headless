import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';
import { getBuildVersion } from '../cloud-build';

export let serviceEnvs: Record<string, pulumi.Input<string>> = null;

interface ServiceEnvsResourceInputs {
  name: string;
  envs: Record<string, pulumi.Input<string>>;
}

class ServiceEnvsProvider implements pulumi.dynamic.ResourceProvider {
  async create(inputs: ServiceEnvsResourceInputs): Promise<pulumi.dynamic.CreateResult> {
    return { id: inputs.name, outs: { ...inputs } };
  }
  async diff(_id, olds: ServiceEnvsResourceInputs, news: ServiceEnvsResourceInputs) {
    const changes = news.envs !== olds.envs;
    return {
      changes,
    };
  }
  async update(_id, _olds: ServiceEnvsResourceInputs, news: ServiceEnvsResourceInputs) {
    return { outs: { ...news } };
  }
  async read(id: any, props: ServiceEnvsResourceInputs): Promise<pulumi.dynamic.ReadResult> {
    return { id, props: props };
  }
}

class ServiceEnvs extends pulumi.dynamic.Resource {
  public readonly envs!: pulumi.Output<Record<string, pulumi.Input<string>>>;
  constructor(name: string, args: ServiceEnvsResourceInputs, opts?: pulumi.CustomResourceOptions) {
    super(new ServiceEnvsProvider(), name, { ...args }, opts);
  }
}

export function createServiceEnvs(envs: Record<string, pulumi.Input<string>>): ServiceEnvs {
  serviceEnvs = envs;
  return new ServiceEnvs('service-envs', { name: 'service-envs', envs });
}

export function getServiceDefaultEnvs(): {
  name: string;
  value: any;
}[] {
  const envs = [
    { name: 'STACK_NAME', value: getConfigs().stack },
    { name: 'PULUMI_STACK_NAME', value: getConfigs().stack },
    { name: 'PULUMI_PROJECT_NAME', value: getConfigs().serviceId },
    {
      name: 'TW_VERSION',
      value: getBuildVersion(),
    },
  ];
  if (process.env.LOG_LEVEL) {
    envs.push({ name: 'LOG_LEVEL', value: process.env.LOG_LEVEL });
  }
  return envs;
}
