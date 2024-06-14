import { CloudTasksClient, protos } from '@google-cloud/tasks';
import { credentials } from '@grpc/grpc-js';
import { localHost, isLocal } from '@tw/constants';
import { getServiceAccountEmail } from './gcp/metadata';
import { getFullUrl } from './getBaseUrl';
import { logger } from './logger';

const clients: Record<string, CloudTasksClient> = {};

export function getClient(local?: boolean): CloudTasksClient {
  const key = local ? 'local' : 'cloud';
  if (!clients[key]) {
    if (local) {
      clients[key] = new CloudTasksClient({
        port: 8026,
        servicePath: localHost,
        sslCreds: credentials.createInsecure(),
      });
    } else {
      clients[key] = new CloudTasksClient();
    }
  }
  return clients[key];
}

export async function addTaskToQueue(
  queueName: string,
  serviceId: string,
  endpoint: string,
  data: any,
  additionalOptions: {
    projectId?: string;
    name?: string;
    dispatchDeadline?: number;
    scheduleTime?: number;
    deployment?: string;
    forceCloud?: boolean;
    log?: boolean;
    ignoreDuplicate?: boolean;
  } = {}
) {
  const {
    projectId = process.env.PROJECT_ID,
    name = null,
    dispatchDeadline,
    scheduleTime,
    deployment,
    forceCloud,
    log = true,
    ignoreDuplicate = false,
  } = additionalOptions;

  const local = isLocal && !forceCloud;
  const client = getClient(local);

  const parent = client.queuePath(projectId, 'us-central1', queueName);
  const { url, audience } = await getFullUrl(serviceId, projectId, endpoint, {
    endpointType: 'authenticated',
    local,
    deployment,
  });
  const task: protos.google.cloud.tasks.v2.ITask = {
    ...(name && { name: `${parent}/tasks/${name}` }),
    httpRequest: {
      httpMethod: 'POST',
      url,
      body: Buffer.from(JSON.stringify(data)),
      headers: { 'Content-Type': 'application/json' },
    },
  };
  if (!local) {
    const serviceAccountEmail = await getServiceAccountEmail();
    task.httpRequest.oidcToken = {
      serviceAccountEmail: serviceAccountEmail,
      audience: audience,
    };
  }
  if (dispatchDeadline) {
    task.dispatchDeadline = { seconds: dispatchDeadline };
  }
  if (scheduleTime) {
    task.scheduleTime = { seconds: scheduleTime + Date.now() / 1000 };
  }
  const request: protos.google.cloud.tasks.v2.ICreateTaskRequest = { parent: parent, task: task };
  // https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues.tasks#Task
  try {
    const [response] = await client.createTask(request);
    if (log) logger.info(`Created task ${response.name}`);
    return response;
  } catch (e) {
    if (ignoreDuplicate && name && e?.code === 6) {
      if (log) logger.info(`Duplicate task ignored ${name}`);
      return;
    }
    logger.error(e);
    throw e;
  }
}
