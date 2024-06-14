import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs, getUniqueNameInProject } from '../utils';
import { toJSONOutput } from '../pulumi-utils';

export function createSecret(
  secretValue: pulumi.Input<Record<string, pulumi.Input<string | number | any[]>>>,
  name?: string
) {
  const { serviceId } = getConfigs();
  name = (getUniqueNameInProject(name) || `${getUniqueNameInProject(serviceId)}-env`) as string;
  const secret = new gcp.secretmanager.Secret(
    name,
    {
      secretId: name,
      replication: {
        auto: {},
      },
    },
    {
      aliases: [{ name: 'secret' }],
    }
  );

  const secretVersion = new gcp.secretmanager.SecretVersion(
    name,
    {
      secret: secret.id,
      secretData: toJSONOutput(secretValue),
    },
    { retainOnDelete: true, aliases: [{ name: 'secret-version' }] }
  );

  return { secret, secretVersion };
}
