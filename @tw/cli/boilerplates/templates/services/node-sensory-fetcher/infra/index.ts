import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import {
  serviceInfraConfig,
  deployTemporalWorker,
  createSensoryServiceAccount,
  loadServiceConfig,
  createSecret,
} from '@tw/pulumi';
const config = new pulumi.Config();
const location = config.require('gcpLocation');
const projectId = pulumi.getStack();
const { env } = loadServiceConfig();
const providerId = env.PROVIDER_ID;

const bucketName = `${providerId}-sensory-${projectId}`;
new gcp.storage.Bucket(bucketName, {
  location: location,
  name: bucketName,
});

const secretValue = {
  app_secrets: {
    CLIENT_ID: config.getSecret('CLIENT_ID'),
    CLIENT_SECRET: config.getSecret('CLIENT_SECRET'),
  },
};
const { secretVersion } = createSecret(secretValue as any);

const { serviceAccount } = createSensoryServiceAccount();

const { deployment } = deployTemporalWorker({
  serviceAccount,
  createK8sDeploymentArgs: {
    secretVersion,
  },
});

serviceInfraConfig();
