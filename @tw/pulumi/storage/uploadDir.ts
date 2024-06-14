import * as fs from 'fs';
import * as gcp from '@pulumi/gcp';

export function uploadDir(args: { bucket: string; dir: string }) {
  const { bucket, dir } = args;
  const objects = [];
  for (const file of fs.readdirSync(dir)) {
    const object = new gcp.storage.BucketObject(`dir-${file}`, {
      name: file,
      bucket,
      source: `${dir}/${file}`,
    });
    objects.push(object);
  }
  return objects;
}
