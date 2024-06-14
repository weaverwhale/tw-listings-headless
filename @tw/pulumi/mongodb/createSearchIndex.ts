import * as pulumi from '@pulumi/pulumi';
import * as mongodbatlas from '@pulumi/mongodbatlas';
import { getConfigs } from '../utils/getConfigs';
import { getStackReference } from '../utils';
import { getMongoAtlasProvider } from './provider';

export function createMongoSearchIndex(args: {
  name: string;
  collectionName: string;
  database?: string;
  clusterName?: pulumi.Input<string>;
}) {
  const { serviceId } = getConfigs();

  const { name, clusterName = 'shared-cluster', collectionName, database = serviceId } = args;
  const globalInfraRef = getStackReference('infra');
  const searchIndex = new mongodbatlas.SearchIndex(
    `${name}-search-index`,
    {
      analyzer: 'lucene.standard',
      name: name,
      clusterName: clusterName,
      collectionName: collectionName,
      database: database,
      mappingsDynamic: true,
      projectId: globalInfraRef.getOutput('mongoDBProjectId'),
      searchAnalyzer: 'lucene.standard',
    },
    { provider: getMongoAtlasProvider() }
  );
  return searchIndex;
}
