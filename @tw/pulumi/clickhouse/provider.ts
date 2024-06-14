import * as clickhouse from '@tw/pulumi-clickhouse';
import * as pulumi from '@pulumi/pulumi';
import { getSecretValue } from '../secrets';

const providers: Record<string, clickhouse.Provider> = {};

export function getClickhouseProvider(args?: { name?: string; replicaName?: string }) {
  const { name = 'sonic-cluster', replicaName = 'instance-0-2' } = args || {};
  const clusterReplicaName = `${name}__${replicaName}`;
  if (providers[clusterReplicaName]) return providers[clusterReplicaName];
  const secret = getSecretValue(`${name}-clickhouse`).apply(JSON.parse);
  const username = secret.apply((s) => s.username);
  const password = pulumi.secret(secret.apply((s) => s.password));

  const replica = secret.apply((s) => s.replicas.find((r: any) => r.name === replicaName).domain);
  const provider = new clickhouse.Provider(
    clusterReplicaName,
    {
      username,
      password,
      host: replica,
      port: 9000,
    },
    { aliases: [{ name: 'clickhouse' }] }
  );
  providers[clusterReplicaName] = provider;
  return provider;
}
