import * as fs from 'fs';
import path from 'path';
import { cliConfig } from '../config';
import { twConfigFile } from '../constants';
import { getPathRelativeToGit, packagesGitUrl } from './git';
import { cliError } from './logs';
import { exit } from 'process';
import { getGitUrl } from '@tw/devops';
import { loadServiceConfig } from '../utils';
import { cliExit } from './exit';

export async function getPackagesRoot() {
  if (fs.existsSync('packages')) return path.resolve('packages');
  const root = await getGitRoot();
  if ((await getGitUrl()) === packagesGitUrl) {
    return root;
  }
  const possiblePaths = [
    path.resolve(root, 'packages'), // if we're in triplewhale/backend/
    path.resolve(root, '..', 'packages'), // if we're in triplewhale/anything
    path.resolve(root, '..', 'backend', 'packages'), // if we're in triplewhale/client
  ];
  for (let p of possiblePaths) if (fs.existsSync(p)) return p;
}

export function getPackageDir(packageName) {
  const standard = `${cliConfig.packagesRoot}/${packageName}`;
  if (fs.existsSync(`${standard}/packages.json`)) return standard;
  const pathPassed = path.resolve(packageName);
  if (fs.existsSync(`${pathPassed}/packages.json`)) return pathPassed;
}

export async function getPackageInfo(pkg: string): Promise<{
  packageName: string;
  packagePath: string;
  absolutePath: string;
  runtime: 'node' | 'python';
}> {
  let packagePath;
  let packageName;
  let runtime;
  let absolutePath;
  const relativePath = (await getPathRelativeToGit()).slice(0, -1);

  if (pkg === '.') {
    // remove the trailing slash
    packagePath = relativePath;
  } else {
    packagePath = relativePath ? `${relativePath}/${pkg}` : pkg;
  }
  absolutePath = path.resolve(pkg);

  if (fs.existsSync(`${absolutePath}/package.json`)) {
    runtime = 'node';
    packageName = JSON.parse(fs.readFileSync(`${absolutePath}/package.json`).toString()).name;
  } else if (fs.existsSync(`${absolutePath}/setup.py`)) {
    runtime = 'python';
    const setupPy = fs.readFileSync(`${absolutePath}/setup.py`, 'utf8');
    // setup.py:
    // name = "tw_utils"
    packageName = setupPy.match(/name\s*=\s*['"](.*)['"]/)[1];
  } else {
    cliExit(`Could not find package.json or requirements.txt in ${pkg}`);
  }

  return { packageName, packagePath, absolutePath, runtime };
}

export async function getGitRoot() {
  const pathRelativeToGit = await getPathRelativeToGit();
  let relPath = '';
  pathRelativeToGit
    .split('/')
    .filter(Boolean)
    .map((_) => (relPath += '../'));
  const root = path.resolve(relPath);
  return root;
}

export async function getServicesRoot() {
  const gitRoot = await getGitRoot();
  const servicesRoot = gitRoot + '/services';
  return servicesRoot;
}

export async function getPipelinesRoot() {
  const gitRoot = await getGitRoot();
  const pipelinesRoot = gitRoot + '/pipelines';
  return pipelinesRoot;
}

export function serviceExits(servicePath: string) {
  return fs.existsSync(`${servicePath}/tw-config.json`);
}

export function pulumiProjectExists(dir: string) {
  return fs.existsSync(`${dir}/Pulumi.yaml`);
}

export function getServiceDir(serviceName: string) {
  const standard = `${cliConfig.servicesRoot}/${serviceName}`;
  if (fs.existsSync(`${standard}/${twConfigFile}`)) return standard;
  const pathPassed = path.resolve(serviceName);
  if (fs.existsSync(`${pathPassed}/${twConfigFile}`)) return pathPassed;
}

export function getServiceName(serviceName: string) {
  if (serviceName === '.') return path.resolve(serviceName).split('/').pop();
  if (serviceName.includes('/')) return serviceName.split('/').pop();
  return serviceName;
}

export async function getServiceInfo(
  srv: string,
  isSaber: boolean = false
): Promise<{
  serviceName: string;
  servicePath: string;
  absolutePath: string;
  runtime: 'node' | 'python';
}> {
  let serviceName;
  let servicePath;
  let absolutePath;
  let runtime;

  const root = isSaber ? cliConfig.pipelinesRoot : cliConfig.servicesRoot;

  // remove the trailing slash
  const relativePath = (await getPathRelativeToGit()).slice(0, -1);
  const isPath = fs.existsSync(`${srv}/${twConfigFile}`);

  if (isPath) {
    absolutePath = path.resolve(srv);
    if (srv === '.') {
      servicePath = relativePath;
    } else {
      if (relativePath) {
        servicePath = `${relativePath}/${srv}`;
      } else {
        servicePath = srv;
      }
    }
  } else {
    serviceName = srv;
    absolutePath = `${root}/${srv}`;
    servicePath = `${root}/${srv}`;
  }
  if (!absolutePath) {
    absolutePath = servicePath;
  }

  if (fs.existsSync(`${absolutePath}/${twConfigFile}`)) {
    serviceName = loadServiceConfig(absolutePath).env.SERVICE_ID;
  } else {
    cliExit(`Could not find tw-config.json in ${absolutePath} for service ${srv}`);
  }

  if (fs.existsSync(`${absolutePath}/package.json`)) {
    runtime = 'node';
  } else if (fs.existsSync(`${absolutePath}/requirements.txt`)) {
    runtime = 'python';
  }

  return { serviceName, servicePath, absolutePath, runtime };
}

export function guessClientRootSync() {
  const possiblePaths = [
    path.resolve('client'), // if we're in /triplewhale
    path.resolve('..', 'client'), // if we're in triplewhale/backend/ or /triplewhale/client
    path.resolve('..', '..', 'client'), // if we're in triplewhale/backend/packages
  ];
  for (let p of possiblePaths) if (fs.existsSync(p)) return p;
}

export function guessServicesRootSync() {
  const possiblePaths = [
    path.resolve('services'), // if we're in /triplewhale
    path.resolve('..', 'services'), // if we're in triplewhale/backend/ or /triplewhale/client
    path.resolve('..', '..', 'services'), // if we're in triplewhale/backend/packages
  ];
  for (let p of possiblePaths) if (fs.existsSync(p)) return p;
}

export function guessPackagesRootSync() {
  const possiblePaths = [
    path.resolve('packages'), // if we're in /triplewhale
    path.resolve('..', 'packages'), // if we're in triplewhale/backend/ or /triplewhale/client
    path.resolve('..', '..', 'packages'), // if we're in triplewhale/backend/packages
  ];
  for (let p of possiblePaths) if (fs.existsSync(p)) return p;
}
