#! /usr/bin/env node
process.env.IS_LOCAL = 'true';
process.env.IS_CLI = 'true';

// silence deprecation warnings
process.removeAllListeners('warning');

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { pullFromPubsub } from './commands/utils/pubsub';
import { linkCommand, linkClientCommand } from './commands/packages/link';
import { upCommand } from './commands/services/up';
import { runNpmAuth } from './utils/npmAuth';
import { execForServices } from './commands/utils/exec';
import printFirebaseToken from './commands/utils/firebaseToken';
import setServiceAccount from './utils/serviceAccount';
import { packageJson } from './constants';
import { setConfig } from './commands/config/set';
import { getConfig } from './commands/config/get';
import { runDeploy } from './commands/deploy';
import { exit } from 'process';
import { updateCommand } from './commands/packages/update';
import { cliConfig, initConfig } from './config';
import { runBuildImage } from './commands/images';
import { runTrigger } from './commands/trigger';
import { invalidateCdnCache } from './commands/utils/cdn';
import { runCommand } from './commands/services/run';
import { runPublish } from './commands/packages/publish';
import {
  getGitRoot,
  getPackagesRoot,
  getPipelinesRoot,
  getServicesRoot,
  guessClientRootSync,
} from './utils/fs';
import { runI } from './commands/i';
import printGcpToken from './commands/utils/gcpToken';
import { runPulumiUp } from './commands/pulumi/up';
import {
  runUnitTests,
  runEndToEndTests,
  runTestsForIntegration,
  validateOptions,
  createSchemaFromFile,
} from './commands/test';
import { runNodemonFromArgv } from './utils/nodemon';
import { printSecret } from './commands/getSecret';
import { diskCreatorBuild } from './commands/utils/diskCreator';
import { getLocalIp } from './commands/utils/localIp';
import { cliError, cliWarning } from './utils/logs';
import { initVenv } from './commands/python/venv';
import { vpnTest } from './commands/utils/vpn';
import { startActivity, startWorkflow } from './commands/temporal/start';
import { cleanUpArtifacts } from './commands/packages/clean';
import { runSummarize } from './commands/summarizePR';
import { runProviderUpdate } from './commands/sensory/provider-update';
import { runRevert } from './commands/revert';
import { openLogs } from './commands/logs';
import { updateAllCloudBuildTriggerStatus } from './commands/utils/triggers';
import { runK8sJob } from './commands/job';
import { runPulumiRefresh } from './commands/pulumi/refresh';
import { modifyPulumiStack } from './commands/utils/pulumi';
import { initTW } from './boilerplates';
import { notifier } from './updateNotifier';
import { buildService } from './commands/services/build';
import { runFormat } from './commands/utils/format';
import { connectToClickhouse } from './commands/clickhouse/chc';
import { cliExit } from './utils/exit';
import { logger } from '@tw/utils/module/logger';
import { runInCloudBuild } from './commands/utils/runInCloudBuild';

const chalk = require('chalk');

notifier.notify({
  message: `Update available ${chalk.red('{currentVersion}')} → ${chalk.green(
    '{latestVersion}'
  )}\n Run ${chalk.blue('tw auth -f && sudo npm i -g @tw/cli')} to update.`,
});

yargs(hideBin(process.argv))
  .parserConfiguration({ 'unknown-options-as-args': true })
  .command({
    command: ['up [services...]'],
    describe: 'start some services',
    builder: (yargs) => {
      return yargs
        .positional('services', {
          describe: 'service(s) to start',
          array: true,
        })
        .option('tag', {
          alias: ['tags', 't'],
          describe: 'run all services with a certain tag',
          example: 'tw up -t admin',
          array: true,
        })
        .option('cloud', {
          describe: 'do not use emulators for pubsub or storage, all calls will go to the cloud.',
          boolean: true,
        })
        .option('local', {
          describe: 'force local mode',
          boolean: true,
        })
        .option('dry-run', {
          describe: 'for saber, will disable sources and sinks',
          boolean: true,
        })
        .option('port', {
          describe: `which port to run the proxy on, this is not fully supported.`,
          alias: '-p',
        })
        .option('project', {
          describe: 'select project',
          string: true,
          default: 'triple-whale-staging',
        })
        .option('fast', {
          alias: 'f',
          describe: 'will not run npm install so will have faster startup time.',
          boolean: true,
        })
        .option('ignore-admin', {
          describe: 'ignore admin claim for auth.',
          boolean: true,
        })
        .option('debug', {
          describe: 'show logs from docker deps',
          array: true,
        })
        .option('trace', {
          describe: 'show trace logs',
          boolean: true,
        })
        .option('b', {
          alias: ['beam'],
          describe: 'up beam',
          boolean: true,
        })
        .option('s', {
          alias: ['saber'],
          describe: 'up saber',
          boolean: true,
        })
        .option('stack', {
          describe: 'pipelines - the pulumi stack from which to pull parameters',
        })
        .option('d', {
          alias: ['dataflow'],
          boolean: true,
          describe: 'pipelines - false for DirectRunner, true for DataflowRunner',
        })
        .option('e', {
          alias: ['entrypoint'],
          describe: 'pipelines - script to execute',
        })
        .option('arg', {
          alias: ['args'],
          describe: 'arguments to pass to script',
          array: true,
        });
    },
    handler: wrapper(upCommand),
  })
  .command({
    command: 'run <service> <file>',
    describe: 'run a service, specifying an entry point',
    handler: wrapper(runCommand),
  })
  .command({
    command: 'packages:link',
    describe: 'link local version of package(s) to local service(s)',
    builder: (yargs) => {
      return yargs
        .option('packages', {
          alias: 'p',
          describe: 'the local package names to link',
          type: 'array',
        })
        .option('services', {
          alias: 's',
          describe: 'the service(s) that will use the local package(s)',
          type: 'array',
        })
        .option('infra', {
          describe: 'link the packages into infra folder',
          boolean: true,
        })
        .example(
          'tw packages:link -p types -s shopify tiktok-ads',
          'will link local version of @tw/types to both shopify and tiktok-ads services'
        )
        .example(
          'tw packages:link -p types utils -s shopify',
          'will link local versions of @tw/types and @tw/utils to shopify service'
        )
        .example(
          'tw packages:link',
          'without -p or -s, will open interactive chooser to choose packages and/or services'
        );
    },
    handler: wrapper(linkCommand),
  })
  .command({
    command: 'packages:link-client',
    describe: 'link local version of package(s) to local client',
    builder: (yargs) => {
      return yargs.option('packages', {
        alias: 'p',
        describe: 'the local package names to link',
        type: 'array',
      });
    },
    handler: wrapper(linkClientCommand),
  })
  .command({
    command: 'packages:update [packages...]',
    describe: 'update internal npm packages',
    builder: (yargs) => {
      return yargs
        .positional('packages', {
          describe: 'package(s) to update',
          array: true,
        })
        .option('select', {
          describe: 'select package(s) to update interactively',
          boolean: true,
        })
        .option('pulumi', {
          describe: 'select from all pulumi projects',
          boolean: true,
        });
    },
    handler: wrapper(updateCommand),
  })
  .command({
    command: 'packages:clean [package]',
    describe: 'clean npm package',
    builder: (yargs) => {
      return yargs.positional('package', {
        describe: 'package to clean',
      });
    },
    handler: wrapper(cleanUpArtifacts),
  })
  .command({
    command: 'publish [packages...]',
    describe: 'publish internal npm packages',
    builder: (yargs) => {
      return yargs
        .positional('packages', {
          describe: 'package(s) to publish',
          array: true,
        })
        .option('select', {
          describe: 'select package(s) to publish interactively',
          boolean: true,
        })
        .option('python', {
          describe: 'needs python to build',
          boolean: true,
        })
        .option('unitTests', {
          alias: 'u',
          describe: 'run unit tests locally before publishing',
          boolean: true,
          default: false,
        });
    },
    handler: wrapper(runPublish),
  })
  .command({
    command: 'utils:cb [script]',
    describe: 'run a command in cloud build',
    handler: wrapper(runInCloudBuild),
  })
  .command({
    command: 'service:build <dir>',
    describe: 'build service docker',
    handler: wrapper(buildService),
  })
  .command({
    command: 'auth',
    describe: 'run npm auth',
    handler: wrapper(runNpmAuth),
    builder: (yargs) => {
      return yargs.option('force', {
        describe: 'force re-auth',
        alias: 'f',
        boolean: true,
      });
    },
  })
  .command({
    command: 'format',
    describe: 'run prettier',
    handler: wrapper(runFormat),
  })
  .command({
    command: 'chc [cluster_name] [replica]',
    describe: 'connect to clickhouse',
    handler: wrapper(connectToClickhouse),
    builder: (yargs) => {
      return yargs
        .option('cluster_name', {
          describe: 'cluster name',
          demandOption: false,
          requiresArg: false,
        })
        .option('replica', {
          describe: 'replica',
          requiresArg: false,
          demandOption: false,
        });
    },
  })
  .command({
    command: 'utils:pubsub',
    describe: 'connect to staging pubsub manager',
    builder: (yargs) => {
      return yargs
        .option('topic', {
          alias: 't',
          describe: 'topic name',
          string: true,
          requiresArg: true,
          demandOption: true,
        })
        .option('service', {
          alias: 's',
          describe: 'service id to connect',
          string: true,
          requiresArg: true,
        })
        .option('endpoint', {
          alias: 'e',
          describe: 'endpoint to call',
          string: true,
          requiresArg: true,
        })
        .option('k', {
          describe: 'print subscription name and exit',
          boolean: true,
        });
    },
    handler: wrapper(pullFromPubsub),
  })
  .command({
    command: 'utils:exec <cmd>',
    describe: 'execute a command for multiple services',
    builder: (yargs) => {
      return yargs.option('select', {
        describe: 'interactively select service(s), when false, all services will be selected',
        boolean: true,
      });
    },
    handler: wrapper(execForServices),
  })
  .command({
    command: 'utils:pulumi',
    handler: wrapper(modifyPulumiStack),
    builder: (yargs) => {
      return yargs.option('provider', {
        boolean: true,
      });
    },
  })
  .command({
    command: 'utils:clear-cdn',
    describe: 'clear cdn cache',
    handler: wrapper(invalidateCdnCache),
  })
  .command({
    command: 'utils:update-triggers',
    describe: 'set triggers status',
    builder: (yargs) => {
      return yargs
        .option('e', {
          describe: 'enable triggers',
          boolean: true,
        })
        .option('d', {
          describe: 'disable triggers',
          boolean: true,
        });
    },
    handler: wrapper(updateAllCloudBuildTriggerStatus),
  })
  .command({
    command: 'utils:disk-creator',
    describe: 'create a disk',
    builder: (yargs) => {
      return yargs.option('prefix', {
        demandOption: true,
        alias: 'p',
        describe: 'the prefix inside the bucket to copy to the disk',
        string: true,
        requiresArg: true,
      });
    },
    handler: wrapper(diskCreatorBuild),
  })
  .command({
    command: 'job',
    describe: 'job',
    handler: wrapper(runK8sJob),
    builder: (yargs) => {
      return yargs
        .option('service', {
          describe: 'service from which to run the job',
          demandOption: true,
          string: true,
        })
        .option('name', {
          describe: 'job name',
          string: true,
          demandOption: true,
        })
        .option('env', {
          describe: 'env vars',
          array: true,
          demandOption: false,
        })
        .option('t', {
          alias: ['trace'],
          describe: 'show trace logs',
          boolean: true,
        });
    },
  })
  .command({
    command: 'token',
    describe: 'print firebase token',
    handler: wrapper(printFirebaseToken),
  })
  .command({
    command: 'python:init-env',
    describe: 'create a python virtual env in the current directory',
    handler: wrapper(initVenv),
  })
  .command({
    command: 'utils:local-ip',
    describe: 'print local ip',
    handler: () => console.log(getLocalIp()),
  })
  .command({
    command: 'utils:vpn-test',
    describe: "test your connection to the vpn's",
    handler: wrapper(vpnTest),
  })
  .command({
    command: 'g-token',
    describe: 'print gcp token',
    handler: wrapper(printGcpToken),
  })
  .command({
    command: 'config:set <key> <value>',
    describe: 'set config value',
    handler: wrapper(setConfig),
  })
  .command({
    command: 'config:get <key>',
    describe: 'get config value',
    handler: wrapper(getConfig),
  })
  .command({
    command: 'sensory:update [service]',
    describe: 'Update a sensory provider',
    builder: (yargs) => {
      return yargs
        .positional('service', {
          describe: 'service to update',
          demandOption: false,
          array: true,
        })
        .option('project', {
          describe: 'select project',
          string: true,
        });
    },
    handler: wrapper(runProviderUpdate),
  })
  .command({
    command: 'deploy [services...]',
    describe: 'deploy service(s) to staging/production',
    builder: (yargs) => {
      return yargs
        .positional('services', {
          describe: 'service(s) to deploy',
          demandOption: false,
          array: true,
        })
        .option('tag', {
          describe: 'deploy all services with a certain tag',
          example: 'tw up --tag admin',
          array: true,
        })
        .option('select', {
          describe:
            'select service(s) to deploy interactively (will override services passed via cli)',
          boolean: true,
        })
        .option('stack', {
          describe: 'select pulumi stack',
          string: true,
        })
        .option('project', {
          describe: 'select project',
          string: true,
        })
        .option('b', {
          alias: ['beam'],
          describe: 'deploy beam',
          boolean: true,
        })
        .option('d', {
          alias: ['debug'],
          describe: 'set log level to debug',
          boolean: true,
        })
        .option('t', {
          alias: ['trace'],
          describe: 'show trace logs',
          boolean: true,
        })
        .option('f', {
          alias: ['force'],
          describe: 'force immediate deployment',
          boolean: true,
        })
        .option('run-tests', {
          alias: ['test', 'a'],
          describe: 'select to include e2e tests running',
          example: 'tw deploy <service> -a',
          boolean: true,
          default: false,
        })
        .option('unitTests', {
          alias: 'u',
          describe: 'run unit tests locally before deploying',
          boolean: true,
          default: false,
        });
    },
    handler: wrapper(runDeploy),
  })
  .command({
    command: 'revert [service]',
    describe: 'roll back a service in production to a previous version',
    builder: (yargs) => {
      return yargs
        .positional('service', {
          describe: 'service to revert',
          demandOption: false,
          array: true,
        })
        .option('tag', {
          describe: 'Docker image tag (commit SHA) to be deployed',
          string: true,
        });
    },
    handler: wrapper(runRevert),
  })
  .command({
    command: 'images:build',
    describe: 'submit gcloud build image',
    builder: (yargs) => {
      return yargs
        .option('f', {
          describe: 'path to Dockerfile',
          requiresArg: true,
          string: true,
        })
        .option('-t', {
          describe: 'extra tag',
          requiresArg: true,
          string: true,
        });
    },
    handler: wrapper(runBuildImage),
  })
  .command({
    command: 'pr',
    describe: 'Summarize git diff changes for a PR',
    handler: wrapper(runSummarize),
  })
  .command({
    command: 't',
    handler: wrapper(openLogs),
  })
  .command({
    command: 'temporal:start-activity',
    describe: '',
    builder: (yargs) => {
      return yargs
        .positional('q', {
          describe: 'queue',
          demandOption: true,
          string: true,
        })
        .positional('t', {
          demandOption: true,
          string: true,
        })
        .option('p', {
          describe: 'payload',
          string: true,
        });
    },
    handler: wrapper(startActivity),
  })
  .command({
    command: 'temporal:start-workflow',
    describe: '',
    builder: (yargs) => {
      return yargs
        .positional('q', {
          describe: 'task queue',
          demandOption: true,
          string: true,
        })
        .positional('t', {
          describe: 'workflow type',
          demandOption: true,
          string: true,
        })
        .option('p', {
          describe: 'payload',
          string: true,
        });
    },
    handler: wrapper(startWorkflow),
  })
  .command({
    command: 'trigger <trigger_name>',
    describe: 'trigger cloud build',
    handler: wrapper(runTrigger),
    builder: (yargs) => {
      return yargs.option('sub', {
        describe: 'substitute variables',
        string: true,
        array: true,
      });
    },
  })
  .command({
    command: 'print-secret <secret_name>',
    describe: 'print secret from secret manager',
    handler: wrapper(printSecret),
  })
  .command({
    command: 'i',
    describe: 'run npm install',
    handler: wrapper(runI),
  })
  .command({
    command: 'cli:nodemon',
    describe: '',
    handler: runNodemonFromArgv,
  })
  .command({
    command: 'pulumi-refresh [dirs...]',
    describe: 'pulumi refresh dirs',
    builder: (yargs) => {
      return yargs
        .positional('dirs', {
          describe: 'pulumi projects to refresh',
          demandOption: false,
          array: true,
        })
        .option('stack', {
          describe: 'select pulumi stack(s)',
          string: true,
        });
    },
    handler: wrapper(runPulumiRefresh),
  })
  .command({
    command: 'pulumi-up [dirs...]',
    describe: 'pulumi up dirs',
    builder: (yargs) => {
      return yargs
        .positional('dirs', {
          describe: 'pulumi projects to deploy',
          demandOption: false,
          array: true,
        })
        .option('stack', {
          describe: 'select pulumi stack',
          string: true,
        })
        .option('project', {
          describe: 'select GCP project',
          string: true,
        })
        .option('noPreview', {
          alias: ['f', 'no-preview'],
          describe: "Don't run a preview locally before triggering the pulumi-up on GCP.",
          type: 'boolean',
        });
    },
    handler: wrapper(runPulumiUp),
  })
  .command({
    command: 'e2e <service_name>',
    describe: 'run e2e tests for specific service (on staging)',
    handler: wrapper(runEndToEndTests),
  })
  .command({
    command: 'test <services>',
    describe: 'run unit tests for services',
    handler: wrapper(runUnitTests),
  })
  .command({
    command: 'create-schema <path>',
    describe: 'extract schema from file',
    handler: wrapper(createSchemaFromFile),
  })
  .command({
    command: 'test:integrations <integration-provider>',
    describe: 'run data tests for specific integration (on staging)',
    builder: (yargs) => {
      return yargs
        .option('integration-id', {
          alias: ['id'],
          describe: 'run tests for specific integration-id',
          demandOption: false,
          type: 'string',
        })
        .option('asset-type', {
          alias: ['stream'],
          describe: 'Integration type',
          demandOption: false,
          type: 'string',
        })
        .option('local-path', {
          alias: ['path', 'p'],
          describe: 'path to your test directory',
          demandOption: false,
          type: 'string',
        })
        .option('date-range', {
          alias: ['range'],
          describe:
            'time range to test. time range in format: mm/dd/yyyy-mm/dd/yyyy (e.g. 01/01/2021-01/02/2021)',
          demandOption: false,

          type: 'string',
        })
        .option('run-in-cloud', {
          alias: ['c'],
          describe: 'run test on gcp',
          demandOption: false,
          type: 'boolean',
        })
        .option('--days-back', {
          alias: ['d'],
          describe: "number of days to go back from today's date to start the analysis or checking",
          demandOption: false,
          type: 'number',
        })
        .check(validateOptions);
    },
    handler: wrapper(runTestsForIntegration),
  })
  .command({
    command: 'init',
    describe: 'init TW project',
    handler: wrapper(initTW),
  })
  .command({
    command: '$0',
    describe: 'fallback',
    handler: wrapper((argv) => {
      if (argv.version) return console.log(packageJson.version);
      cliExit(`Unknown command: ${JSON.stringify(argv)}`);
    }),
  })
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .help('help')
  .version(false)
  .option('prod', {
    describe: 'set project to shofifi.',
    boolean: true,
    group: 'Global Options',
  })
  .option('stg', {
    describe: 'set project to triple-whale-staging.',
    boolean: true,
    group: 'Global Options',
  })
  .option('sa', {
    describe: `use a service account for auth to gcp instead of gcloud (this is needed in some cases).
      service account is loaded from ./service-account-{project}.json`,
    boolean: true,
    group: 'Global Options',
  })
  .option('project', {
    describe: 'select project',
    string: true,
    group: 'Global Options',
  })
  .option('version', {
    describe: `Show version number`,
    boolean: true,
    group: 'Global Options',
  })
  .option('help', {
    describe: `Show help`,
    boolean: true,
    group: 'Global Options',
  })
  .parse();

function wrapper(fn: Function) {
  return async function (_argv) {
    try {
      if (!process.env.TW_COMMAND) {
        process.env.TW_COMMAND = _argv._[0];
      }
      initConfig(_argv);

      if (_argv.cloud) {
        if (process.env.PROJECT_ID === 'shofifi') {
          cliExit('It is illegal to set --cloud on production!!');
        }
        process.env.FORCE_CLOUD = 'true';
      }
      if (_argv.local) {
        process.env.FORCE_LOCAL = 'true';
      }
      if (_argv.sa) {
        setServiceAccount();
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        cliWarning(
          'GOOGLE_APPLICATION_CREDENTIALS is exported, this might cause auth issues.' +
            '\n  If this was unintentional run: unset GOOGLE_APPLICATION_CREDENTIALS'
        );
      }
      if (_argv.port) {
        cliConfig.proxyPort = _argv.port;
        process.env.PROXY_HOST = `localhost:${_argv.port}`;
      }
      cliConfig.clientRoot = guessClientRootSync();
      try {
        cliConfig.servicesRoot = await getServicesRoot();
        cliConfig.pipelinesRoot = await getPipelinesRoot();
        cliConfig.packagesRoot = await getPackagesRoot();
        cliConfig.gitRoot = await getGitRoot();
      } catch {}

      return await fn(_argv);
    } catch (err) {
      logger.error({ err });
      cliExit();
    }
  };
}

process.on('SIGINT', () => {
  exit(0);
});

process.on('warning', (e) => console.warn(e.stack));
