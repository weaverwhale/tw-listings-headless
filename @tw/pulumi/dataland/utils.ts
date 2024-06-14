import * as pulumi from '@pulumi/pulumi';
import * as crypto from 'crypto';
import { getConfigs, getSecretId, getUniqueNameInProject } from '../utils';
import * as gcp from '@pulumi/gcp';
import { getDataformRepositoryNameForProject, rootDatasetId } from './names';

const STAGING_ENV = 'staging';
const PRODUCTION_ENV = 'prod';
const PRE_PRODUCTION_ENV = 'pre-prod';
const DEVELOPMENT_ENV = 'dev';
export const Projects = {
  DataLand: 'triplewhale-dataland',
  DataLandOps: 'triplewhale-dataland-ops',
};

export const getDlcpTagByStack = (stackName: string): string => {
  switch (stackName) {
    case 'shofifi':
      return '.prod';
    case 'pre-prod':
      return '.pre-prod';
    case 'triple-whale-staging':
      return '.staging';
    default:
      return '';
  }
};

export const SchedulePolicies = {
  Sparse: '55       * * * *',
  Large: '0,30     * * * *',
  Medium: '5,25,45  * * * *',
  Regular: '*/15     * * * *',
  Dense: '*/10      * * * *',
  Dense2: '0,8,15,23,30,38,45,53 * * * *',
  Rapid: '*/5       * * * *',
  Intense: '*/3     * * * *',
};

const MAX_SERVICE_ACCOUNT_LENGTH = 30;

export function isCanonicalStack(): boolean {
  return ['shofifi', 'triple-whale-staging', 'pre-prod'].includes(pulumi.getStack());
}

// Get environment name from stack name
const getEnvNameFromStackName = (stackName: string): string => {
  switch (stackName) {
    case 'triple-whale-staging':
      return STAGING_ENV;
    case 'pre-prod':
      return PRE_PRODUCTION_ENV;
    case 'shofifi':
      return PRODUCTION_ENV;
    default:
      return DEVELOPMENT_ENV;
  }
};

const getDefaultLabels = (): Record<string, string> => {
  return {
    dataland: 'true',
    environment: getEnvNameFromStackName(pulumi.getStack()), // staging, prod, dev, pre-prod
  };
};

export function setDefaultLabelsForAllResources() {
  pulumi.runtime.registerStackTransformation((args: any) => {
    if ('labels' in args.props) {
      args.props['labels'] = {
        ...args.props['labels'],
        ...getDefaultLabels(),
      };
    }

    return { props: args.props, opts: args.opts };
  });
}

// this is only necessary when the name of the service account needs to hash the serviceId to be unique
// for example, the service account for the pipeline workflows. they need the workflow name to be unique from one another
// but service account names can only be 30 chars. so we hash and slice
export function createUniqueServiceAccountName(type: string, serviceId: string) {
  return `${getUniqueNameInProject(`dataland-${type}`)}-${crypto
    .createHash('sha1')
    .update(serviceId)
    .digest('hex')}`.slice(0, MAX_SERVICE_ACCOUNT_LENGTH);
}

export function asBqSchema(schema: Array<Object>, configureAsView?: boolean) {
  const keysToInclude = ['name', 'type', 'mode', 'description', 'fields'];
  const filteredSchema = schema.map((dict) =>
    Object.fromEntries(Object.entries(dict).filter(([entry]) => keysToInclude.includes(entry)))
  );
  return filteredSchema.map((entry) => {
    if (configureAsView && entry.mode === 'REQUIRED') {
      delete entry.mode;
    }
    if (entry.fields) {
      entry.fields = asBqSchema(entry.fields, configureAsView);
    }
    return entry;
  });
}

export function buildTableArgs(args: {
  schema: Array<Object>;
  clusterings?: string[];
  labels?: {};
  partitioning?: {};
  rangePartitioning?: {};
}) {
  const tableArgs: Record<string, any> = {
    schema: JSON.stringify(asBqSchema(args.schema)),
    clusterings: args.clusterings,
    labels: { ...args.labels },
  };
  if (args.partitioning) tableArgs['timePartitioning'] = args.partitioning;
  else if (args.rangePartitioning) tableArgs['rangePartitioning'] = args.rangePartitioning;

  return tableArgs;
}

export function createDataformReposOnProject(dfProject: string) {
  const { location, stack } = getConfigs();

  new gcp.dataform.Repository(`dataformRepository`, {
    region: location,
    name: getDataformRepositoryNameForProject(stack),
    gitRemoteSettings: {
      url: 'https://github.com/Triple-Whale/dataland-dataform.git',
      defaultBranch: 'develop',
      authenticationTokenSecretVersion: pulumi.interpolate`projects/${
        getConfigs().projectNumber
      }/secrets/github-access-token/versions/latest`,
    },
    npmrcEnvironmentVariablesSecretVersion: getSecretId('npm-token'),
    project: dfProject,
  });
}

export function overridePartitioning(tableArgs) {
  const partitionType = tableArgs['timePartitioning']
    ? 'timePartitioning'
    : tableArgs['rangePartitioning']
    ? 'rangePartitioning'
    : null;
  const partitioning = tableArgs[partitionType]
    ? Object.assign({}, tableArgs[partitionType])
    : null;

  const requirePartitionFilter =
    tableArgs?.requirePartitionFilter || partitioning?.requirePartitionFilter || null;

  if (partitioning?.hasOwnProperty('requirePartitionFilter')) {
    delete partitioning.requirePartitionFilter;
    tableArgs[partitionType] = partitioning;
  }
  return { overwritenTableArgs: tableArgs, requirePartitionFilter };
}

export function createRoot(table, outputDataModel, labels = []) {
  let tableArgs = buildTableArgs({
    schema: outputDataModel.schema,
    clusterings: outputDataModel.clusterings,
    labels,
    partitioning: outputDataModel.partitioning,
    rangePartitioning: outputDataModel.rangePartitioning,
  });
  const { overwritenTableArgs, requirePartitionFilter } = overridePartitioning(tableArgs);
  tableArgs = overwritenTableArgs;

  return new gcp.bigquery.Table(`${table}-output-root`, {
    datasetId: rootDatasetId,
    tableId: table,
    ...tableArgs,
    requirePartitionFilter,
  });
}
