import * as docker from '@pulumi/docker';

let provider: docker.Provider;

export function getDockerProvider() {
  if (!provider) {
    provider = new docker.Provider('provider', {
      host: 'unix:///var/run/docker.sock',
      registryAuth: [
        {
          address: 'us-central1-docker.pkg.dev',
          authDisabled: false,
          // configFile: '~/.docker/config.json',
        },
      ],
    });
  }
  return provider;
}
