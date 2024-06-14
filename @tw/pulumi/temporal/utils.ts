import { Client, Connection, ScheduleNotFoundError } from '@temporalio/client';

let clients: Record<string, Client> = {};

export function getTemporalAddress(args: { projectId: string }) {
  const { projectId } = args;

  return `${projectId === 'triple-whale-staging' ? 'stg.' : ''}temporal-server.internal.whale3.io`;
}

export function getTemporalNamespace(args: { providerId?: string; serviceId: string }) {
  const { providerId, serviceId } = args;
  return providerId ? `${providerId}-sensory` : `${serviceId}-ns`;
}

export async function getTemporalClient(args: {
  projectId: string;
  serviceId: string;
  namespace?: string;
  providerId?: string;
}) {
  const { providerId, projectId, serviceId } = args;
  const { namespace = getTemporalNamespace({ providerId, serviceId }) } = args;
  if (clients[namespace]) {
    return clients[namespace];
  }
  const connection = await Connection.connect({
    address: getTemporalAddress({ projectId }),
  });
  const client = new Client({
    connection,
    namespace,
  });
  clients[namespace] = client;
  await client.connection.ensureConnected();
  return client;
}

export async function getSchedule(args: {
  projectId: string;
  serviceId: string;
  scheduleId: string;
  namespace?: string;
}) {
  const { projectId, serviceId, scheduleId, namespace } = args;
  const temporalClient = await getTemporalClient({ projectId, serviceId, namespace });
  const scheduleHandler = temporalClient.schedule.getHandle(scheduleId);
  try {
    return await scheduleHandler.describe();
  } catch (e) {
    if (e instanceof ScheduleNotFoundError) {
      return null;
    }
    throw e;
  }
}
