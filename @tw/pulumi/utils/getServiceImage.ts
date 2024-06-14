import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';
import { getConfigs } from './getConfigs';
import { getUniqueNameInProject } from './getUniqueName';
import { getDockerProvider } from '../docker';

export function getServiceImage(
  args: { serviceId?: string; imageTag?: string; projectId?: string; resolve?: boolean } = {}
) {
  const { serviceId: configServiceId, location } = getConfigs();
  const {
    serviceId = configServiceId,
    imageTag = process.env.GITHUB_SHA || 'latest',
    projectId = getConfigs().projectId,
    resolve,
  } = args;

  const imageName = pulumi.interpolate`${projectId}/cloud-run/${getUniqueNameInProject(serviceId)}`;

  const registryUrl = `${location}-docker.pkg.dev`;

  const image = pulumi.interpolate`${registryUrl}/${imageName}:${imageTag}`;
  if (!resolve) return image;

  const registryImage = docker.getRegistryImageOutput(
    {
      name: image,
    },
    { provider: getDockerProvider() }
  );
  return registryImage.sha256Digest.apply(
    (digest) => pulumi.interpolate`${registryUrl}/${imageName}@${digest}`
  );
}
