import * as gcp from '@pulumi/gcp';

export function createDiskFromImage(args: {
  name: string;
  image: gcp.compute.Image;
  zone?: string;
  size?: number;
  type?: string;
}) {
  const { name, image, zone = 'us-central1-a', size = 100, type = 'pd-ssd' } = args;
  const disk = new gcp.compute.Disk(`${name}-${zone}`, {
    physicalBlockSizeBytes: 4096,
    type,
    zone,
    image: image.selfLink,
    size,
  });
  return disk;
}
