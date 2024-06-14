import * as fs from 'node:fs';
import * as path from 'node:path';
import { merge } from '@tw/utils/module/object';
import { TWTsRepo } from './types';
import { logger } from './log';
import { DIRNAME } from './config';

export async function makeTypescriptDefaults(info: TWTsRepo) {
  const source = path.resolve(DIRNAME, 'templates', info.templateDir);
  makePackageJson(info, source);
  makeTsConfigJson(info, source);
  if (info.isJest) {
    makeJestConfig(info, source);
  }
}

function makePackageJson(info: TWTsRepo, source: string) {
  logger.info('Making package.json', '...');
  const customTemplatePath = path.join(source, 'package.json');
  const hasCustomTemplate = fs.existsSync(customTemplatePath);
  let pkgJson = hasCustomTemplate
    ? JSON.parse(fs.readFileSync(customTemplatePath).toString())
        .replace('$SERVICE_ID', info.computerName)
        .replace('$SERVICE_NAME', info.humanName)
        .replace('$COLOR', info.color)
    : makeDefaultPkgJson(info);
  if (info.packageJsonOverrides) {
    pkgJson = merge(pkgJson, info.packageJsonOverrides);
  }
  const pkgJsonPath = path.join(info.path, 'package.json');
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
}

function makeDefaultPkgJson(info: TWTsRepo) {
  return info.isPackage ? makePackagePkgJson(info) : info.isService ? makeServicePkgJson(info) : {};
}

function makeTsConfigJson(info: TWTsRepo, source: string) {
  logger.info('Making tsconfig.json', '...');
  const customTemplatePath = path.join(source, 'tsconfig.json');
  const hasCustomTemplate = fs.existsSync(customTemplatePath);
  let tsConfig = hasCustomTemplate
    ? JSON.parse(fs.readFileSync(customTemplatePath).toString())
    : info.isPackage
    ? makePackageTsConfig(info, source)
    : info.isService
    ? makeServiceTsConfig(info, source)
    : {};
  if (info.tsConfigOverrides) {
    tsConfig = merge(tsConfig, info.tsConfigOverrides);
  }
  const tsConfigPath = path.join(info.path, 'tsconfig.json');
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
}

function makeServicePkgJson(info: TWTsRepo) {
  return {
    name: info.computerName,
    description: 'Triple Whale ' + info.humanName + ' Service',
    version: '1.0.0',
    main: 'dist/app.js',
    scripts: {
      start: 'node dist/app.js',
      dev: 'npx nodemon ${nodemonArgs}',
      build: 'tsc',
      deploy: 'tw deploy .',
    },
    author: 'Triple Whale, Inc.',
    license: 'ISC',
  };
}

function makePackagePkgJson(info: TWTsRepo) {
  return {
    name: '@tw/' + info.computerName,
    description: 'Triple Whale ' + info.humanName + ' Package',
    version: '0.0.1',
    main: 'module/index.js',
    scripts: {
      dev: 'tsc --watch --preserveWatchOutput',
      build: 'npm i && tsc',
      deploy: 'tw publish .',
    },
    author: 'Triple Whale, Inc.',
    license: 'ISC',
    types: './module/index.d.ts',
    tw: {
      color: info.color,
      maintainers: info.maintainers,
    },
  };
}

function makeServiceTsConfig(info: TWTsRepo, source: string) {
  return {
    compilerOptions: {
      target: 'es2021',
      module: 'commonjs',
      resolveJsonModule: true,
      outDir: './dist/',
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      experimentalDecorators: true,
      strict: true,
      skipLibCheck: true,
      sourceMap: true,
    },
    include: ['src/'],
    exclude: ['**/*.test.ts'],
  };
}

function makePackageTsConfig(info: TWTsRepo, source: string) {
  return {
    compilerOptions: {
      target: 'es2021',
      module: 'commonjs',
      resolveJsonModule: true,
      outDir: './module/',
      declaration: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
      sourceMap: true,
      declarationMap: true,
    },
    include: ['src/'],
    exclude: ['**/*.test.ts'],
  };
}

const defaultJestConfigPath = path.join(DIRNAME, 'templates', 'general', 'ts', 'jest.config.ts');
function makeJestConfig(info: TWTsRepo, source: string) {
  logger.info('Making jest.config.json', '...');
  const customTemplatePath = path.join(source, 'jest.config.ts');
  const hasCustomTemplate = fs.existsSync(customTemplatePath);
  let jestConfig = hasCustomTemplate
    ? fs.readFileSync(customTemplatePath).toString()
    : fs.readFileSync(defaultJestConfigPath).toString();

  fs.writeFileSync(path.join(info.path, 'jest.config.ts'), jestConfig);
}
