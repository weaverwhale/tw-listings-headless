import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { envToObject } from '../utils';
import { getCurrentBranch } from './git';
import { cliLog, cliError, cliWarning } from './logs';
import { getPulumiStacks, selectStacks, STACK_PROJECT_KEY } from './pulumi';
import { runPulumiUp } from '../commands/pulumi/up';
import { getGcloudUserEmail } from '@tw/devops';
import { packageJson } from '../constants';
import { cliExit } from './exit';

export async function triggerCloudBuilds(args: {
  argv;
  buildNames: string[];
  substitutions?: Record<string, string>;
  dirs?: string[];
  applicableStacks?: string[];
  envs?: string[];
}) {
  const { argv, buildNames, dirs, envs = [] } = args;
  if (!buildNames.length) {
    cliExit('No triggers passed.');
  }
  let { substitutions = {}, applicableStacks } = args;
  const client = new CloudBuildClient();

  if (argv.python) {
    substitutions['_TAG'] = 'fat';
  }
  const branch = await getCurrentBranch();
  const author = getGcloudUserEmail();
  let subs = argv.sub || [];
  let test = argv.test || undefined;

  if (!Array.isArray(subs)) subs = [subs];

  for (const sub of subs) {
    if (!(sub as string).startsWith('_')) {
      cliExit('All substitutions must start with an _.');
    }
    substitutions = { ...envToObject(sub), ...substitutions };
  }
  substitutions = { ...substitutions, _RUN_TESTS: test };

  // stacks here can mean project-ids in some cases
  const stacks = getPulumiStacks(dirs);
  applicableStacks = applicableStacks || (await getApplicableStacks(argv, dirs));

  if (envs.length) {
    substitutions['_BUILD_ENVS'] = envs.join(',');
  }

  substitutions['_CLI_VERSION'] = packageJson.version;

  // remove undefined values
  substitutions = Object.fromEntries(
    Object.entries(substitutions).filter(([_, v]) => v !== undefined)
  );

  var buildUrls = [];
  let msg = `Running Triggers: ${buildNames.join(', ')}.
  Branch: ${branch}.
  Stacks: ${applicableStacks.join(', ')}.`;
  if (Object.keys(substitutions).length) {
    msg += `\n  Substitutions: ${JSON.stringify(substitutions)}`;
  }
  cliWarning(msg + '\n');

  for (const [index, buildName] of buildNames.entries()) {
    for (const stack of applicableStacks) {
      const projectId = stacks[stack].config[STACK_PROJECT_KEY];
      var substitutionsForStack = { ...substitutions };
      if (projectId !== stack) {
        substitutionsForStack = { _STACK: stack, ...substitutionsForStack };
      }
      try {
        const res = await Promise.any(
          ['global', 'us-central1'].map((location) => {
            return client.getBuildTrigger({
              projectId,
              name: `projects/${projectId}/locations/${location}/triggers/${buildName}`,
            });
          })
        );
        const buildTrigger = res[0];
        if (buildTrigger.disabled) {
          cliError(`${buildName} (${projectId}) is disabled.`);
          continue;
        }
        const triggerRes = (
          await client.runBuildTrigger({
            projectId,
            triggerId: buildTrigger.id,
            source: {
              branchName: branch,
              substitutions: { _AUTHOR: author, ...substitutionsForStack },
            },
          })
        )[0];
        const buildUrl =
          triggerRes.metadata['build'].logUrl ||
          `https://console.cloud.google.com/cloud-build/builds/${triggerRes.metadata['build'].id}?project=${projectId}`;
        buildUrls = buildUrls.concat(buildUrl);
        cliLog(`${buildName} (${stack}) logs: ${buildUrl}`);
      } catch (e) {
        const pattern = /triggerError spanner trigger \(.*\) not found/;
        if (e.errors?.[0]?.code === 5 && pattern.exec(e.errors?.[0]?.details)) {
          cliLog('Trigger does not exist. Creating...');
          await runPulumiUp(
            {
              stack,
              dirs: dirs.slice(index, index + 1),
              noPreview: true,
            },
            true
          );
          cliWarning("\nWhen the above build completes, please rerun your 'tw deploy' command");
        } else {
          cliError(`Error for ${buildName} on ${projectId}: ${e}`);
        }
      }
    }
  }
  return buildUrls;
}

export async function getApplicableStacks(argv: any, dirs: string[]) {
  const branch = await getCurrentBranch();
  const stacks = getPulumiStacks(dirs);
  let applicableStacks = Object.keys(stacks);

  if (argv.stack) {
    applicableStacks = applicableStacks.filter((v) => v === argv.stack);
  }

  if (argv.project) {
    applicableStacks = applicableStacks.filter(
      (stackName) => stacks[stackName].config[STACK_PROJECT_KEY] === argv.project
    );
  }

  if (branch !== 'master') {
    applicableStacks = applicableStacks.filter((stackName) => stackName !== 'shofifi');
  }

  if (applicableStacks.length > 1) {
    applicableStacks = await selectStacks(applicableStacks);
  }

  if (!applicableStacks.length) {
    cliExit('No stacks selected.');
  }
  return applicableStacks;
}
