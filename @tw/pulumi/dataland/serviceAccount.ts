import { createServiceAccount } from '../service';
import { getConfigs } from '../utils';

export function createChronosServiceAccount() {
  const { projectId } = getConfigs();
  const { serviceAccount } = createServiceAccount({
    addDefault: false,
    roles: [`projects/${projectId}/roles/chronosServiceAccount`],
  });

  return { serviceAccount };
}
