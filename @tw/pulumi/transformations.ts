import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { createLabels, shouldOmitLabels } from './utils';
import { isLocal } from './constants';
import { monitoringState } from './monitoring/state';
import { globalState } from './utils/globalState';
import { renderToYaml } from './k8s';
import { createDatadogPostgresqlSchema } from './datadog';
import { getGitRepoName, getPathRelativeToGit, kubeAuth } from '@tw/devops';
import * as fs from 'fs';
import { TwPulumiStack } from './pulumi-utils';
import { getAuthor } from './monitoring';

export function runTransformations() {
  const enforceLabels = [
    gcp.redis.Instance,
    gcp.pubsub.Topic,
    gcp.pubsub.Subscription,
    gcp.storage.Bucket,
    gcp.secretmanager.Secret,
    gcp.compute.GlobalForwardingRule,
    gcp.compute.ForwardingRule,
    gcp.bigtable.Instance,
    gcp.workflows.Workflow,
    gcp.bigquery.Table,
  ].map((r) => getType(r));

  const packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
  const packageLockVersion = JSON.parse(
    fs.readFileSync(process.cwd() + '/package-lock.json').toString()
  ).packages['node_modules/@tw/pulumi'].version;
  if (pulumi.getOrganization() !== 'triplewhale') {
    throw new Error('Organization must be triplewhale');
  }
  new TwPulumiStack('tw-pulumi-stack', {
    name: 'tw-pulumi-stack',
    version: packageJson.version,
    packageLockVersion,
    linked: !__dirname.includes('node_modules'),
    buildId: process.env.BUILD_ID,
    userEmail: getAuthor(),
    repo: pulumi.output(getGitRepoName()),
    relPath: pulumi.output(getPathRelativeToGit()),
    locked: Boolean(process.env.LOCK),
  });

  pulumi.runtime.registerStackTransformation((args) => {
    const originalProps = args.props;
    const opts = {};
    const props: any = {};

    if (args.type === getType(gcp.redis.Instance)) {
      monitoringState.redis.enabled = true;
      monitoringState.redis.resourceNames.push(originalProps.name);
    }
    if (args.type === getType(gcp.bigtable.Instance)) {
      monitoringState.bigtable.enabled = true;
    }
    if (args.type === getType(gcp.storage.Bucket)) {
      monitoringState.storage.enabled = true;
    }
    if (args.type === getType(gcp.cloudtasks.Queue)) {
      monitoringState.cloudTasks.enabled = true;
      monitoringState.cloudTasks.resourceNames.push(originalProps.name);
    }
    if (args.type === getType(gcp.pubsub.Subscription)) {
      monitoringState.pubsub.enabled = true;
      if (!originalProps.expirationPolicy) {
        props.expirationPolicy = { ttl: '' };
      }
    }
    if (args.type === getType(gcp.sql.Database)) {
      createDatadogPostgresqlSchema({
        database: originalProps.name,
        instanceName: originalProps.instance,
      });
    }
    if (enforceLabels.includes(args.type)) {
      props.labels = { ...createLabels(), ...originalProps.labels };
    }
    if (shouldOmitLabels(originalProps.labels)) {
      delete props.labels;
    }
    if (args.type.startsWith('kubernetes:')) {
      // @ts-ignore
      if (!args.opts.provider && !args.opts.parent?.__providers) {
        throw Error(`provider not set for ${args.type} ${args.name}.`);
      }
      if (!args.type.startsWith('kubernetes:helm.sh') && !args.type.startsWith('kubernetes:yaml')) {
        renderToYaml(args);
      }
      // @ts-ignore
      if (args.opts.provider && !args.opts.dependsOn?.length) {
        // @ts-ignore
        args.opts.dependsOn = [args.opts.provider.dependsOn, ...(args.opts.dependsOn || [])];
      }
    }
    if (args.type === 'pulumi:providers:kubernetes') {
      const context = args.props.context;
      kubeAuth(context);
    }
    if (!globalState[args.type]) {
      globalState[args.type] = [];
    }
    globalState[args.type].push(args);
    return {
      props: pulumi.mergeOptions(args.props, props),
      opts: pulumi.mergeOptions(args.opts, opts),
    };
  });

  function getType(resource): string {
    return resource.__pulumiType;
  }
}

if (!isLocal) {
  runTransformations();
}
