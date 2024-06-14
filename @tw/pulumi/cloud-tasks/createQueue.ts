import * as gcp from '@pulumi/gcp';

export function createQueue(name: string, args: gcp.cloudtasks.QueueArgs) {
  const queue = new gcp.cloudtasks.Queue(name, args, { protect: true });
  return queue;
}
