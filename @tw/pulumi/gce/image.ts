import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';

export function createImageFromGcs(args: { name: string; object: string }): gcp.compute.Image {
  const { name, object } = args;
  const { projectId } = getConfigs();

  const gen = getLiveObjectGeneration(projectId, object);

  const image = new gcp.compute.Image(
    `${name}-${projectId}`,
    {
      rawDisk: {
        source: pulumi.interpolate`https://storage.googleapis.com/ai-assets-${projectId}/images/${object}.tar.gz`,
      },
      storageLocations: ['us-central1'],
      labels: {
        generation: getLiveObjectGeneration(projectId, object),
      },
    },
    {
      replaceOnChanges: ['labels.generation'],
    }
  );

  return image;
}

function getLiveObjectGeneration(projectId: string, object: string) {
  let bucket = pulumi.interpolate`ai-assets-${projectId}`;
  let name = pulumi.interpolate`images/${object}.tar.gz`;
  return pulumi
    .all([bucket, name])
    .apply(([bucket, name]) =>
      pulumi
        .output(gcp.storage.getBucketObject({ bucket, name }))
        .apply((v) => extractGenerationFromMediaUrl(v.mediaLink))
    );
}

function extractGenerationFromMediaUrl(url: string) {
  const regex = /generation=(\d+)/g;
  const match = regex.exec(url);
  if (match) {
    return match[1];
  }
  return '';
}
