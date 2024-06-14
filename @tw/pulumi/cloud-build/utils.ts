import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils/getConfigs';

export function getDevopsImage(
  imageName: string,
  tag: pulumi.Input<string> = 'latest'
): pulumi.Output<string> {
  const { projectId } = getConfigs();
  return pulumi.interpolate`us-central1-docker.pkg.dev/${projectId}/devops-docker/${imageName}:${tag}`;
}

export const defaultCmd = {
  python:
    'exec gunicorn -k uvicorn.workers.UvicornWorker --bind :8080 --workers 1 --threads 8 --timeout 0 --chdir src app:app',
  node: 'npm start',
};
