import { triggerCloudBuilds } from '../utils/cloudBuild';
import { runTests, addSchemaFromFile } from '@tw/e2e-tests';
import { getSecrets } from '../utils';
import { selectStacks } from '../utils/pulumi';
import { runNpmTest } from '../utils/runNpmTest';

export async function runEndToEndTests(argv: any) {
  try {
    //TODO: add option to run in cloud
    const service: string = argv.service_name;
    const optinalStacks = ['production-api', 'staging-api', 'localhost-api'];
    const stacks = await selectStacks(optinalStacks);
    for (const stack of stacks) {
      //TODO: vpn ok, local: service is up
      // @ts-ignore
      const { results, globalConfig } = await runTests(service, stack, { subValues: argv._ });
    }
  } catch (err) {
    return;
  }
}
export async function runTestsForIntegration(argv: any) {
  if (argv.runInCloud) {
    const url = await triggerCloudBuilds({
      argv,
      buildNames: ['run-e2e-tests'],
      substitutions: {
        _SERVICE_ID: 'integrations',
        _TESTS_OPTS: JSON.stringify(argv),
      },
    });
    return;
  }
  const projectId = 'triple-whale-staging';
  process.env.TW_TESTS_SECRETS = await getSecrets('automation-tests', projectId);
  process.env.TESTS_OPTS = JSON.stringify(argv);
  const { results, globalConfig } = await runTests('integrations');
}

export function validateDaysBackOption(argv) {
  const daysBack = argv.daysBack;
  if (typeof daysBack !== 'undefined' && (isNaN(daysBack) || daysBack < 0)) {
    throw new Error('Invalid --days-back option. It should be a non-negative number.');
  }
  return true;
}

export function validateOptions(argv) {
  const daysBack = argv.daysBack;
  const dateRange = argv.dateRange;

  if (typeof daysBack !== 'undefined' && (isNaN(daysBack) || daysBack < 0)) {
    throw new Error('Invalid --days-back option. It should be a non-negative number.');
  }

  if (typeof dateRange !== 'undefined') {
    // Check if the date range follows the format mm/dd/yyyy-mm/dd/yyyy
    const dateRangePattern = /^\d{2}\/\d{2}\/\d{4}-\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRangePattern.test(dateRange)) {
      throw new Error('Invalid --date-range option. The format should be mm/dd/yyyy-mm/dd/yyyy.');
    }
  }
  return true;
}
export async function createSchemaFromFile(argv) {
  const path = argv.path;
  await addSchemaFromFile(path);
}

export async function runUnitTests(argv) {
  // TODO: billyd
  console.log('Implement me');
}
