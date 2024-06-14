import * as fs from 'fs';
import { createProxy } from '../../proxy';
import { runProcess } from '../../utils/runProcess';
import {
  getDefaultNodemonConfig,
  getLinkedPackages,
  getSecrets,
  getUserEnv,
  loadServiceConfig,
  serviceLogStream,
} from '../../utils';
import { handleDockerDeps } from '../../utils/dockerDeps';
import { runAndBuildPackages } from '../../utils/installAndBuildPackages';
import { cliError, cliLog, cliWarning } from '../../utils/logs';
import { runNpmAuth } from '../../utils/npmAuth';
import { ServiceData, Services } from '../../types';
import { cliConfig } from '../../config';
import { getServiceInfo } from '../../utils/fs';
import { getEnvs } from '../../utils/env';
import { spawnNodemonInTw } from '../../utils/nodemon';
import { getPipCommand, getPythonCommand } from '../../utils/python';
import { getPulumiOutputs, getPulumiStackExport } from '../utils/pulumi';
import { STACK_PROJECT_KEY, getPulumiStacks, selectStack } from '../../utils/pulumi';
import { checkEmulators, checkTemporal, getPipelineId, getServiceIds } from '../../utils/upTools';
import { cliExit } from '../../utils/exit';

export async function upCommand(argv: any) {
  const serviceIds = argv.saber ? await getPipelineId(argv) : await getServiceIds(argv);
  const serviceInfos = await Promise.all(
    serviceIds.map(async (s) => await getServiceInfo(s, argv.saber))
  );
  const dirs = serviceInfos.map((s) => s.absolutePath + '/infra');

  let stack = argv.stack;
  if (argv.saber && !stack) {
    stack = await getApplicableStack(argv, dirs);
  }
  if (!serviceIds) {
    cliExit('No services or pipelines selected');
  }

  if (argv['dry-run']) {
    process.env.SABER_DRY_RUN = 'true';
  }

  const services: Services = cliConfig.services;

  const serviceDependencies = new Set<string>();
  const allLinkedPackages = new Set<string>();

  if (!argv.fast) {
    await runNpmAuth();
  }

  for (let serviceInfo of serviceInfos) {
    const serviceDir = serviceInfo.servicePath;
    const absolutePath = serviceInfo.absolutePath;
    const serviceId = serviceInfo.serviceName;
    const serviceConfig = loadServiceConfig(absolutePath);
    const linkedPackages = [];
    if (serviceConfig?.runtime !== 'python') {
      linkedPackages.push(...getLinkedPackages(absolutePath));
      if (argv.saber) {
        argv.entrypoint = `$(which saber) ${argv.entrypoint ? `--main ${argv.entrypoint}` : ''}`;
      }
      const nodemonConfig = JSON.parse(JSON.stringify(getDefaultNodemonConfig(argv.entrypoint)));
      for (const linkedPackage of linkedPackages) {
        nodemonConfig.watch.push(linkedPackage);
        allLinkedPackages.add(linkedPackage);
      }
      try {
        fs.mkdirSync(`${absolutePath}/dist`);
      } catch {}
      fs.writeFileSync(`${absolutePath}/dist/nodemon.json`, JSON.stringify(nodemonConfig));
    }

    const secrets = { TW_SECRETS: await getSecrets(serviceId) };
    const userEnv = getUserEnv(absolutePath);
    const servicePort = Math.floor(Math.random() * (65535 - 10000) + 10000);
    services[serviceId] = {
      id: serviceId,
      secrets,
      config: serviceConfig,
      serviceDir,
      absolutePath,
      linkedPackages,
      servicePort,
      userEnv,
    };
    serviceConfig.dependencies?.forEach((dep) => serviceDependencies.add(dep));
  }

  handleDockerDeps([...serviceDependencies], argv.debug).catch((e) => {
    cliError('Failed to handle docker dependencies');
    console.error(e);
  });

  runAndBuildPackages(allLinkedPackages);

  for (const serviceId of Object.keys(services)) {
    const serviceData = services[serviceId];
    cliLog(
      `Starting ${serviceId}, linked packages: ${
        serviceData.linkedPackages.join(', ') || 'none'
      }, internal port: ${serviceData.servicePort}`
    );
    runService({ argv, serviceData, stack }).catch((e) => {
      cliWarning(`Failed to start ${serviceId}`);
      console.error(e);
      cliExit(e.message);
    });
  }
  if (!argv.s) createProxy(services);
  if ([...serviceDependencies].includes('emulators')) {
    checkEmulators({ projectId: argv.project });
  }
  if ([...serviceDependencies].includes('temporal')) {
    checkTemporal();
  }
}

async function runService(args: { argv; serviceData: ServiceData; stack?: string }) {
  const { argv, serviceData, stack } = args;
  let extraArgs: string;
  let additionalEnv: {};
  if (argv.saber) {
    try {
      const stackExport = await getPulumiStackExport({
        cwd: `${serviceData.absolutePath}/infra`,
        stack,
      });

      const serviceEnvs = stackExport['deployment']['resources'].find((v) => {
        return v.type === 'pulumi-nodejs:dynamic:Resource' && v.id === 'service-envs';
      });
      if (!serviceEnvs) {
      } else {
        additionalEnv = serviceEnvs['inputs']['envs'];
      }
    } catch {}
  } else if (argv.beam) {
    cliLog(`pulling parameters from pulumi stack ${stack}`);
    const pulumiOutputs = await getPulumiOutputs({
      cwd: `${serviceData.absolutePath}/infra`,
      stack,
    });
    if (!pulumiOutputs.parameters) {
      cliWarning('"parameters" not outputted by pulumi stack. passing no params');
    }
    const paramArgs = Object.entries(pulumiOutputs.parameters || {})
      .map(([key, value]) => `--${key}=${value}`)
      .join(' ');

    let customArgs = argv.args?.map((arg: string) => `--${arg}`).join(' ');

    const runnerArgs = argv.dataflow
      ? `--runner DataflowRunner --temp_location gs://tw-dataflows-${argv.project}/${serviceData.id}/temp --project ${argv.project}`
      : `--runner DirectRunner`;
    extraArgs = [paramArgs, customArgs, runnerArgs].filter(Boolean).join(' ');
    cliLog(`running pipeline with args: ${extraArgs}`);
  }

  if (serviceData.config.runtime === 'python') {
    await runPythonService({
      serviceData,
      file: argv.entrypoint,
      extraArgs,
    });
  } else {
    await runNodeService({ argv, serviceData, extraArgs, additionalEnv });
  }
}

async function runNodeService(args: {
  argv;
  serviceData: ServiceData;
  extraArgs?: string;
  additionalEnv: {};
}) {
  const { argv, serviceData, extraArgs, additionalEnv } = args;
  const serviceId = serviceData.id;

  if (!argv.fast) {
    await runProcess({
      name: serviceId,
      command: 'tw',
      commandArgs: ['i', '--prefix', serviceData.absolutePath, '--preserve'],
      color: serviceData.config.color,
      log: true,
    });
  }
  runProcess({
    name: serviceId,
    command: 'npm',
    commandArgs: [
      'run',
      'dev',
      '--prefix',
      serviceData.absolutePath,
      ...(extraArgs ? [extraArgs] : []),
    ],
    additionalArgs: {
      env: {
        ...getEnvs(),
        ...serviceData.config.env,
        ...serviceData.secrets,
        ...serviceData.userEnv,
        ...additionalEnv,
        nodemonArgs: '--config dist/nodemon.json --signal SIGINT',
        PORT: serviceData.servicePort,
      },
    },
    color: serviceData.config.color,
    log: true,
  });
}

export async function runPythonService(args: {
  serviceData: ServiceData;
  file?: string;
  extraArgs?: string;
}) {
  const { serviceData, file = 'src/app.py', extraArgs } = args;
  const VIRTUAL_ENV = `${serviceData.absolutePath}/venv`;
  const venvEnv = {
    PATH: `${VIRTUAL_ENV}/bin:${process.env.PATH}`,
    VIRTUAL_ENV,
  };
  const pythonCommand = await getPythonCommand();
  await ensureVenv(serviceData, venvEnv);

  await pipInstall(serviceData, venvEnv);

  // run
  spawnNodemonInTw({
    name: serviceData.id,
    command: `bash`,
    commandArgs: [
      '-c',
      `${
        process.env.DD ? 'ddtrace-run' : ''
      } ${pythonCommand} -m debugpy --listen $DEBUG_PORT ${file}${
        extraArgs ? ' ' + extraArgs : ''
      }`,
    ],
    nodemonSettings: {
      watch: ['src/*'],
      cwd: serviceData.absolutePath,
      env: {
        ...getEnvs(),
        ...serviceData.config.env,
        ...serviceData.secrets,
        ...serviceData.userEnv,
        PORT: serviceData.servicePort,
        ...venvEnv,
      },
    },
    color: serviceData.config.color,
    log: true,
  });
}

async function ensureVenv(serviceData: ServiceData, venvEnv) {
  await runProcess({
    name: serviceData.id,
    command: 'tw',
    commandArgs: ['python:init-env'],
    additionalArgs: {
      cwd: serviceData.absolutePath,
      env: {
        ...venvEnv,
      },
    },
    color: serviceData.config.color,
    log: true,
  });
}

async function pipInstall(serviceData: ServiceData, venvEnv: any) {
  const pipCommand = await getPipCommand();
  const prevFile = serviceData.absolutePath + '/venv/requirements.txt';
  const currFile = serviceData.absolutePath + '/requirements.txt';
  const prevReq = fs.existsSync(prevFile) ? fs.readFileSync(prevFile).toString() : '';
  const currReq = fs.readFileSync(currFile).toString();
  if (prevReq !== currReq) {
    // install requirements
    await runProcess({
      name: serviceData.id,
      command: pipCommand,
      commandArgs: [
        'install',
        '--index-url=https://us-python.pkg.dev/shofifi/python-virtual/simple',
        '-r',
        'requirements.txt',
      ],
      additionalArgs: {
        cwd: serviceData.absolutePath,
        env: {
          ...venvEnv,
        },
      },
      color: serviceData.config.color,
      log: true,
    });
    fs.writeFileSync(prevFile, currReq);
  } else {
    serviceLogStream('Requirements unchanged', serviceData.id, serviceData.config.color);
  }
}

async function getApplicableStack(argv: any, dirs: string[]) {
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

  let stack: string;
  if (applicableStacks.length === 1) {
    stack = applicableStacks[0];
  } else {
    stack = await selectStack(applicableStacks);
  }

  if (!stack) {
    cliExit('No stacks selected.');
  }
  return stack;
}
