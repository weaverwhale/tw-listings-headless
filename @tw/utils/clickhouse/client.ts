import { createClient, ClickHouseClient } from '@clickhouse/client';
import { getSecretFromManager } from '../secrets';
import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config';

export async function getClickHouseClient(args: { name: string }): Promise<ClickHouseClient> {
  const config = await getClickhouseConnectionConfig(args);
  return createClient(config);
}

export async function getClickhouseSecret(name: string) {
  return JSON.parse(await getSecretFromManager(`${name}-clickhouse`));
}

export async function getClickhouseConnectionConfig(args?: {
  name: string;
  replicaName?: string;
}): Promise<NodeClickHouseClientConfigOptions> {
  const { name = 'sonic-cluster', replicaName } = args || {};
  const secret = await getClickhouseSecret(name);
  const domain = replicaName
    ? secret.replicas.find((r: any) => r.name === replicaName).domain
    : secret.clickhouseTcpDomain;
  const config = {
    url: `http://${domain}:8123`,
    username: secret.username,
    password: secret.password,
  };
  return config;
}
