import chalk from 'chalk';
import * as fs from 'fs';
import { ServiceConfig } from '@tw/types';
import path from 'path';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { cliError, cliWarning } from './utils/logs';
import { exit } from 'process';
import { cliExit } from './utils/exit';

export function serviceLogStream(stream, service?, color?) {
  const str = stream.toString();
  const lines = str.split('\n');
  lines.forEach((line: any) => {
    let message = line;
    if (!line) return;
    if (service) {
      message = `${chalk.hex(color || '5032a8')(service)} | ` + message;
    }
    console.log(message);
  });
}

export function loadServiceConfig(serviceDir: string): ServiceConfig {
  const data = fs.readFileSync(`${serviceDir}/tw-config.json`);
  return JSON.parse(data.toString());
}

export async function loadPackageJson(args: { packagePath?: string }) {
  const { packagePath } = args;
  const data = fs.readFileSync(`${packagePath}/package.json`);
  return JSON.parse(data.toString());
}

export function getDefaultNodemonConfig(entrypoint: string = 'dist/app.js') {
  const command = `npm run build && node --expose-gc --inspect=0.0.0.0:$\{DEBUG_PORT\} ${entrypoint}`;
  return {
    watch: ['src/'],
    execMap: {
      js: command,
      ts: command,
    },
    ext: 'js,ts',
    delay: 2,
  };
}

export async function getSecrets(serviceId: string, projectId?: string): Promise<string> {
  const project = projectId || process.env.PROJECT_ID;
  try {
    const client = new SecretManagerServiceClient();
    const [accessResponse] = await client.accessSecretVersion({
      name: `projects/${project}/secrets/${serviceId}-env/versions/latest`,
    });
    const responsePayload = accessResponse.payload.data.toString();
    return responsePayload;
  } catch (e) {
    if (e.code === 7) {
      if (project === 'shofifi') {
        cliWarning(
          `Could not get secrets for ${serviceId} on ${project}, trying to get from triple-whale-staging.`
        );
        return await getSecrets(serviceId, 'triple-whale-staging');
      }
      cliExit(`You do not have access to Secret Manger for ${serviceId} on project ${project}!`);
    }
    cliWarning('no secrets for ' + serviceId);
    return '';
  }
}

export function getUserEnv(serviceDir) {
  if (fs.existsSync(`${serviceDir}/.env`)) {
    const envData = fs.readFileSync(`${serviceDir}/.env`);
    return envToObject(envData.toString());
  }
}

export function getLinkedPackages(serviceDir) {
  const twDepsDir = `${serviceDir}/node_modules/@tw`;
  if (!fs.existsSync(twDepsDir)) return [];
  const packages = fs.readdirSync(twDepsDir);
  return packages
    .filter((packagePath) => fs.lstatSync(`${twDepsDir}/${packagePath}`).isSymbolicLink())
    .map((pkg) => path.resolve(twDepsDir, fs.readlinkSync(`${twDepsDir}/${pkg}`)));
}

export function envToObject(envString) {
  let result = {};
  envString.split('\n').map((line) => {
    const [key, value] = line.split('=', 2);
    if (key && value) {
      result[key] = value;
    }
  });
  return result;
}

export function objectToEnv(envObject) {
  const result = [];
  Object.keys(envObject).map((key) => {
    result.push(`${key}=${envObject[key]}`);
  });
  return result;
}
