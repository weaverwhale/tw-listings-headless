import * as pulumi from '@pulumi/pulumi';
import * as mongodbatlas from '@pulumi/mongodbatlas';
import { getStackReference } from '../utils';
import { getConfigs } from '../utils/getConfigs';
import { monitoringState } from '../monitoring/state';

export function getMongoDbConnectionString(
  mongoDbUser,
  additionalOptions: {
    cluster?: mongodbatlas.Cluster;
    defaultDb?: string;
    privateLink?: boolean;
    clusterName?: string;
  } = {}
) {
  const { serviceId, projectId } = getConfigs();
  const { defaultDb = serviceId, privateLink = true, cluster } = additionalOptions;
  let clusterName = additionalOptions.clusterName || cluster?.name || 'shared-cluster';
  monitoringState.mongo.enabled = true;
  monitoringState.mongo.resourceNames.push(clusterName);
  let mongoSrvAddressId;
  if (cluster) {
    mongoSrvAddressId = cluster?.srvAddress?.apply((i) => i?.split('.')?.[1]);
  } else {
    const globalInfraRef = getStackReference(`infra`, projectId);
    mongoSrvAddressId = globalInfraRef.getOutput('mongoSrvAddressId');
  }
  const auth = pulumi.interpolate`${mongoDbUser.username}:${mongoDbUser.password}`;
  clusterName = privateLink ? pulumi.interpolate`${clusterName}-pl-0` : clusterName;
  const result = pulumi.interpolate`mongodb+srv://${auth}@${clusterName}.${mongoSrvAddressId}.mongodb.net/${defaultDb}`;
  return result;
}
