import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { cliConfig } from '../../config';
import { cliLog } from '../../utils/logs';

export async function updateAllCloudBuildTriggerStatus(argv) {
  let disabled;
  if (argv.e) {
    disabled = false;
  } else if (argv.d) {
    disabled = true;
  } else {
    throw new Error('Must specify either -e or -d');
  }
  const client = new CloudBuildClient({ projectId: cliConfig.projectId });

  const [triggers] = await client.listBuildTriggers({
    projectId: cliConfig.projectId,
  });
  for (const trigger of triggers) {
    cliLog(`Updating ${trigger.name} to ${disabled ? 'disabled' : 'enabled'}`);
    trigger.disabled = disabled;
    await client.updateBuildTrigger({
      trigger,
      projectId: cliConfig.projectId,
      triggerId: trigger.id,
    });
  }
}
