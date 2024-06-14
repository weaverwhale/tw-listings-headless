import * as mongodbatlas from '@pulumi/mongodbatlas';
import { isProduction } from '../constants';
import { getStackReference } from '../utils';
import { getMongoAtlasProvider } from './provider';

export function createMongoCluster(args: {
  name: string;
  providerInstanceSizeName: string;
  providerAutoScalingComputeMaxInstanceSize?: string;
  providerAutoScalingComputeMinInstanceSize?: string;
  advancedConfiguration?: mongodbatlas.types.input.ClusterAdvancedConfiguration;
  clusterType?: string;
  numShards?: number;
  cloudBackup?: boolean;
}) {
  const {
    name,
    providerInstanceSizeName,
    cloudBackup = isProduction ? true : false,
    advancedConfiguration,
    numShards,
    clusterType = 'REPLICASET',
  } = args;
  const globalInfraRef = getStackReference('infra');

  const providerAutoScalingComputeMaxInstanceSize =
    args.providerAutoScalingComputeMaxInstanceSize || providerInstanceSizeName;
  const providerAutoScalingComputeMinInstanceSize =
    args.providerAutoScalingComputeMinInstanceSize || providerInstanceSizeName;

  const mongoCluster = new mongodbatlas.Cluster(
    name,
    {
      // https://www.mongodb.com/docs/atlas/reference/api/clusters-create-one/
      name,
      projectId: globalInfraRef.getOutput('mongoDBProjectId'),
      providerInstanceSizeName,
      providerName: 'GCP',
      providerRegionName: 'CENTRAL_US',
      cloudBackup,
      clusterType,
      numShards,
      mongoDbMajorVersion: '6.0',
      autoScalingDiskGbEnabled: true,
      autoScalingComputeEnabled: true,
      autoScalingComputeScaleDownEnabled: true,
      providerAutoScalingComputeMaxInstanceSize,
      providerAutoScalingComputeMinInstanceSize,
      advancedConfiguration,
    },
    { protect: true, provider: getMongoAtlasProvider(), aliases: [{ name: 'mongo-cluster' }] }
  );

  if (cloudBackup) {
    new mongodbatlas.CloudBackupSchedule(
      name,
      {
        clusterName: mongoCluster.name,
        projectId: mongoCluster.projectId,
        policyItemDaily: {
          frequencyInterval: 1,
          retentionUnit: 'days',
          retentionValue: 7,
        },
      },
      { provider: getMongoAtlasProvider() }
    );
  }

  return { mongoCluster };
}
