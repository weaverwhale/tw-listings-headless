import * as fs from 'node:fs';
import * as path from 'node:path';
import { npmInstall } from './npmInstall';
import type { TWServiceRepo } from './types';
import { logger } from './log';
import { DIRNAME } from './config';
import { replaceInFiles } from './copyFiles';

const defaultInfraPath = path.join(DIRNAME, 'templates/infra');

export function makeInfra(info: TWServiceRepo) {
  logger.info('Making service infra', '...');
  makeInfraPackageJson(info);
  makePulumiYamls(info);
  copyTemplateInfraFiles(info);
}

function makeInfraPackageJson(info: TWServiceRepo) {
  const customInfraPackageJson = path.join(info.templateDir, 'infra', 'package.json');
  if (fs.existsSync(customInfraPackageJson)) {
    logger.info('Using template infra/package.json');
    return;
  }
  logger.info('Making infra/package.json', '...');
  const defaults = {
    name: `${info.computerName}-infra`,
  };
  if (!fs.existsSync(path.join(info.path, 'infra'))) {
    fs.mkdirSync(path.join(info.path, 'infra'));
  }
  fs.writeFileSync(
    path.join(info.path, 'infra', 'package.json'),
    JSON.stringify(defaults, null, 2)
  );
  logger.info('Installing infra dependencies', '...');
  npmInstall(path.join(info.path, 'infra'), info.infraDependencies || [], [
    'typescript',
    '@types/node',
  ]);
}

function makePulumiYamls(info: TWServiceRepo) {
  logger.info('Making pulumi yamls', '...');
  const sourcePath = path.join(DIRNAME, 'templates', 'general', 'pulumi');
  const destinationPath = path.join(info.path, 'infra');
  for (let file of fs.readdirSync(sourcePath)) {
    const yamlContent = fs.readFileSync(path.join(sourcePath, file)).toString();
    fs.writeFileSync(
      path.join(destinationPath, file),
      yamlContent
        .replace(/\$SERVICE_ID/g, info.computerName)
        .replace(/\$SERVICE_NAME/g, info.humanName)
    );
  }
}

function copyTemplateInfraFiles(info: TWServiceRepo) {
  logger.info('Copying files from template', '...');
  const sourceInfra = path.resolve(DIRNAME, 'templates', info.templateDir, 'infra');
  const hasCustomInfra = fs.existsSync(sourceInfra);
  const standardInfra = path.resolve(DIRNAME, 'templates', 'infra');
  const destination = path.resolve(DIRNAME, info.path, 'infra');
  fs.cpSync(standardInfra, destination, { recursive: true, force: true, verbatimSymlinks: true });
  if (hasCustomInfra) {
    fs.cpSync(sourceInfra, destination, { recursive: true, force: true, verbatimSymlinks: true });
  }
  replaceInFiles(info, destination);
}
