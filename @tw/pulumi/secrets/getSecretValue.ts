import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

export function getSecretValue(secret: pulumi.Output<string> | string) {
  return gcp.secretmanager.getSecretVersionOutput({ secret }).secretData;
}
