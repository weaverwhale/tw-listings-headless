import * as pulumi from '@pulumi/pulumi';
import * as fs from 'fs';
import { getGitSha } from '@tw/devops';

interface BuildNumberResourceInputs {
  name: string;
  gitSha: pulumi.Input<string>;
  buildNumber?: string;
}

let buildNumber: BuildNumber;

class BuildNumberProvider implements pulumi.dynamic.ResourceProvider {
  async create(inputs: BuildNumberResourceInputs): Promise<pulumi.dynamic.CreateResult> {
    return { id: inputs.name, outs: { ...inputs, buildNumber: '1' } };
  }
  async diff(_id, olds: BuildNumberResourceInputs, news: BuildNumberResourceInputs) {
    const changes = news.gitSha !== olds.gitSha;
    return {
      changes,
    };
  }
  async update(_id, olds: BuildNumberResourceInputs, news: BuildNumberResourceInputs) {
    const version = Number(olds.buildNumber || '0') + 1;
    return { outs: { ...news, buildNumber: String(version) } };
  }
  async read(id: any, props: BuildNumberResourceInputs): Promise<pulumi.dynamic.ReadResult> {
    return { id, props: props };
  }
}

export class BuildNumber extends pulumi.dynamic.Resource {
  public readonly buildNumber!: pulumi.Output<string>;
  public readonly gitSha!: pulumi.Output<string>;
  constructor(name: string, args: BuildNumberResourceInputs, opts?: pulumi.CustomResourceOptions) {
    super(
      new BuildNumberProvider(),
      name,
      { buildNumber: undefined, gitSha: undefined, ...args },
      opts
    );
  }
}

export function getBuildVersion() {
  const gitSha = getGitSha(true);
  if (!buildNumber) {
    buildNumber = new BuildNumber('build-number', {
      name: 'build-number',
      gitSha,
    });
    if (process.env.IS_CLOUD_BUILD) {
      buildNumber.buildNumber.apply((buildNumber) => {
        fs.writeFileSync('build-number.txt', buildNumber);
      });
    }
  }
  const version = buildNumber.buildNumber.apply((buildNumber) => `${buildNumber}.0.0`);
  return version;
}
