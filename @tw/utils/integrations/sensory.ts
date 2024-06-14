import { projectId } from '@tw/constants';

export function getBucket() {
  return `data-lake-sensory-${projectId}`;
}
