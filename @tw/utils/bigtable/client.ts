import { Bigtable } from '@google-cloud/bigtable';
import { projectId } from '@tw/constants';

const storageClients: Record<string, Bigtable> = {};

export function getBigtableClient(args?: { projectId: string }) {
  const project = args?.projectId || projectId;
  if (!storageClients[project]) {
    storageClients[project] = new Bigtable({ projectId: project });
  }
  return storageClients[project];
}
