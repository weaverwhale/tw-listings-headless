import { triggerCloudBuilds } from '../utils/cloudBuild';
import { cliExit } from '../utils/exit';

export async function runTrigger(argv) {
  const triggerName = argv.trigger_name || argv._.slice(1)[0];

  if (!triggerName) {
    cliExit('No trigger.');
  }
  await triggerCloudBuilds({ argv, buildNames: [triggerName] });
}
