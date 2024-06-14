import {
  deployToKnative,
  createServiceAccount,
  serviceInfraConfig,
  createSecret,
} from '@tw/pulumi';

const secretValue = {};

const { secretVersion } = createSecret(secretValue);

const { serviceAccount } = createServiceAccount();

const { deployment } = deployToKnative({
  serviceAccount,
  createKnativeServingArgs: {
    secretVersion,
  },
});

serviceInfraConfig({ apiGateway: { service: deployment } });
