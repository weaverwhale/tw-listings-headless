import * as pulumi from '@pulumi/pulumi';

interface TwPulumiStackResourceInputs {
  name: string;
  version: string;
  packageLockVersion: string;
  linked: boolean;
  buildId: string;
  locked: boolean;
  repo: pulumi.Input<string>;
  relPath: pulumi.Input<string>;
  userEmail: string;
}

class TwPulumiStackProvider implements pulumi.dynamic.ResourceProvider {
  async create(inputs: TwPulumiStackResourceInputs): Promise<pulumi.dynamic.CreateResult> {
    return { id: inputs.name, outs: { ...inputs } };
  }
  async diff(_id, olds: TwPulumiStackResourceInputs, news: TwPulumiStackResourceInputs) {
    const changes = Boolean(Object.keys(news).filter((key) => news[key] !== olds[key]).length);
    if (olds.locked && news.userEmail !== olds.userEmail) {
      const message = `This stack is locked to user: ${olds.userEmail}, pls reach out to them to unlock it.`;
      console.error(message);
      process.exit(1);
    }
    // compare the version in package-lock.json with the version in the package.json
    if (news.packageLockVersion !== news.version || !(news.packageLockVersion || news.version)) {
      if (!news.linked) {
        const message = `
The Triple Whale Devops team has got your back! We have detected that you forgot to run npm install.
The version of @tw/pulumi in package-lock.json (${news.packageLockVersion}) does not match the version you have installed (${news.version}).
Please run npm install to fix this issue.`;
        console.error(message);
        process.exit(1);
      } else {
        console.log('Notice: You are running @tw/pulumi from the source code (linked).');
      }
    }
    if (olds.repo && news.repo) {
      if (news.repo !== olds.repo) {
        console.error(
          'The repository name cannot be changed. Pls reach out to the Triple Whale Devops team for help.'
        );
        process.exit(1);
      }
    }
    if (olds.relPath && news.relPath) {
      if (news.relPath !== olds.relPath) {
        console.error(
          'The relative path cannot be changed. Pls reach out to the Triple Whale Devops team for help.'
        );
        process.exit(1);
      }
    }
    return {
      changes,
    };
  }
  async update(_id, _olds: TwPulumiStackResourceInputs, news: TwPulumiStackResourceInputs) {
    return { outs: { ...news } };
  }
  async read(id: any, props: TwPulumiStackResourceInputs): Promise<pulumi.dynamic.ReadResult> {
    return { id, props: props };
  }
}

export class TwPulumiStack extends pulumi.dynamic.Resource {
  public readonly buildNumber!: pulumi.Output<string>;
  public readonly gitSha!: pulumi.Output<string>;
  constructor(
    name: string,
    args: TwPulumiStackResourceInputs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(new TwPulumiStackProvider(), name, { ...args }, opts);
  }
}
