import * as gcp from '@pulumi/gcp';
import * as fs from 'fs';
import { resolve } from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as pulumiGoogleNative from '@pulumi/google-native';
import { getConfigs, getUniqueNameInProject } from '../utils';
import { getDlcpTagByStack } from './utils';
import { buildView } from './bq-views';
import {
  isCanonicalStack,
  setDefaultLabelsForAllResources,
  asBqSchema,
  buildTableArgs,
  Projects,
  overridePartitioning,
} from './utils';
import {
  createTopicSubscriptionNotification,
  createSubscriptionToExistingTopic,
  BucketSubscriptionAndNotificationConfig,
  SubscriptionExistingTopicConfig,
} from './subscription-notification';
import {
  changesetDatasetId,
  latestDatasetId,
  publicDatasetId,
  rawDatasetId,
  recentDatasetId,
  deadLetterTopicId,
  chronosIngestService,
  getDataformRepositoryNameForProject,
  getDataformRepositoryIdForProject,
  rootDatasetId,
  currentDatasetId
} from './names';
import { toBase64Output, toJSONOutput } from '../pulumi-utils';
import { createServiceAccount } from '../service';
import { addRolesToServiceAccount } from '../iam';
import { rootBaseSchema, rootBaseClusterings, rootTablePartitioning, baseDirtySchema} from "@tw/chronos-mdl-bundle";

const PAUSE_ALL_PIPELINES = false;
export class SubRunConfig {
  constructor(schedule: string, label: string) {
    this.schedule = schedule;
    this.label = label;
  }
  schedule: string;
  label: string;
}

// Parameters for the task scheduler
export interface schedulerConfigArgs {
  schedule?: string;
  paused?: boolean;
  subRuns?: Array<SubRunConfig>;
}

export const schedulerConfigArgsDefault: schedulerConfigArgs = {
  schedule: '0 * * * *', // hourly
  paused: false,
  subRuns: [],
};

// Parameters regarding the data model (=tables on different datasets).
// TODO: make this more formalized.
interface outputDataModelArgs {
  schema: Array<Object>;
  partitioning?;
  rangePartitioning?;
  clusterings?: Array<string>;
  changesetClusterings?: Array<string>;
  changesetSchema?: Array<Object>;
  createTableOutputLatest?: boolean;
  createViewOutputPublic?: boolean;
  createRootTable?: boolean;
  outputViewAdditionalSQL?: string;
  createTableOutputChangeset?: boolean;
  changesetPartitionSize?: number;
  outputTableName?: string;
  additionalOutputTables?: string[];
  skip?: boolean;
  changesetTimePartitioning?;
}

const outputDataModelDefault: outputDataModelArgs = {
  schema: [],
  partitioning: null,
  rangePartitioning: null,
  clusterings: [],
  changesetClusterings: null,
  changesetSchema: null,
  createTableOutputLatest: true,
  createViewOutputPublic: true,
  createRootTable: true,
  outputViewAdditionalSQL: '',
  createTableOutputChangeset: true,
  changesetPartitionSize: 50,
  outputTableName: '',
  additionalOutputTables: [],
  changesetTimePartitioning: null,
};

export interface JobDetailsDep {
  proc_id_to?: string;
  proc_id_from?: string;
}

// Parameters regarding input datasets, used in pipelines with an upstream pipeline.
export interface inputDataModelArgs {
  inputTableName?: string;
  inputDatasetName?: string;
  dependencies?: Record<string, JobDetailsDep>;
  isDerived?: boolean;
}

export const inputDataModelDefault: inputDataModelArgs = {
  inputTableName: '',
  inputDatasetName: '',
  dependencies: {},
  isDerived: false,
};

// Parameters for configuring subscriptions, used to ingest data into dataland-raw.
interface ingestSubscriptionConfigArgs {
  ingestEndPoint?: string;
  subscriptionConfig?: SubscriptionExistingTopicConfig[];
  bucketSubscriptionAndNotificationConfig?: BucketSubscriptionAndNotificationConfig[];
}

const ingestSubscriptionConfigDefault: ingestSubscriptionConfigArgs = {
  ingestEndPoint: '',
  subscriptionConfig: [],
  bucketSubscriptionAndNotificationConfig: [],
};

// Paramaters used for testing, including forcing parts of the pipeline to run on different stacks or branches.
export interface testConfigArgs {
  forceDataformBranch?: string;
}

export const testConfigDefault: testConfigArgs = {
  forceDataformBranch: undefined,
};

// Misc params with a pipeline-wide effect
export interface pipelinePropertiesArgs {
  pipelineName?: string; // Unique name for the pipeline. If one is not provided, defaults to the output data model name
  pipelineLabels?: object;
  runnerOnDifferentProject?: string;
  dlcpGitRef?: string; // Git commit/branch/tag to use for DLCP pipelines
}

export const pipelinePropertiesDefault: pipelinePropertiesArgs = {
  pipelineName: '',
  pipelineLabels: {},
  runnerOnDifferentProject: '',
  dlcpGitRef: undefined, // For legacy pipelines!
};

export interface rootTableConfig {
  schema?: Array<Object>;
  clusterings?: Array<string>;
  partitioning?;
  createRootTable?:boolean;
}

export const rootTableConfigBase: rootTableConfig = {
  schema: rootBaseSchema,
  clusterings: rootBaseClusterings,
  partitioning: rootTablePartitioning.field,
  createRootTable: false
}

interface CdcPipelineArgs {
  pipelineProperties?: pipelinePropertiesArgs;
  schedulerConfig?: schedulerConfigArgs;
  outputDataModel: outputDataModelArgs;
  ingestSubscriptionConfig?: ingestSubscriptionConfigArgs; //
  inputDataModel?: inputDataModelArgs;
  rootTableConfig?: rootTableConfig;
  testConfig?: testConfigArgs;
  currentConfig?: currentConfig;
}

export function createCdcPipeline({
  pipelineProperties, // Params with a pipeline-wide effect (name, labels)
  schedulerConfig, // Scheduling configuration for the pipeline and its subruns
  outputDataModel, // Output data model schema and datasets
  ingestSubscriptionConfig, // Configuration for subscriptions to ingest data into dataland-raw
  inputDataModel, // Configuration for input datasets, used in pipelines with an upstream pipeline.
  rootTableConfig, // Output root table
  testConfig, // Output data model schema and datasets
  currentConfig,
}: CdcPipelineArgs) {
  const returns: any = {};

  // Set defaults for nestesd object arguments
  pipelineProperties = { ...pipelinePropertiesDefault, ...pipelineProperties };
  schedulerConfig = { ...schedulerConfigArgsDefault, ...schedulerConfig };
  outputDataModel = { ...outputDataModelDefault, ...outputDataModel };
  ingestSubscriptionConfig = { ...ingestSubscriptionConfigDefault, ...ingestSubscriptionConfig };
  inputDataModel = { ...inputDataModelDefault, ...inputDataModel };
  testConfig = { ...testConfigDefault, ...testConfig };

  const { serviceId: pipelineId, stack, projectId, location } = getConfigs();

  const { serviceAccount } = createServiceAccount({
    name: `dl-${pipelineId}`,
    roles: [`projects/${projectId}/roles/datalandService`],
  });

  if (stack === 'shofifi') {
    addRolesToServiceAccount(serviceAccount, Projects.DataLandOps, [
      'roles/dataform.editor',
      'roles/bigquery.jobUser',
      'roles/bigquery.dataOwner',
      'roles/bigquery.resourceViewer',
    ]);
    addRolesToServiceAccount(serviceAccount, 'triple-whale-ops', [
      'roles/dataform.editor',
      'roles/bigquery.jobUser',
      'roles/bigquery.dataOwner',
      'roles/bigquery.resourceViewer',
    ]);
  } else {
    addRolesToServiceAccount(serviceAccount, 'triple-whale-ops', ['roles/bigquery.dataViewer']);
  }
  if (stack === 'triple-whale-staging') {
    addRolesToServiceAccount(serviceAccount, 'shofifi', [
      'roles/bigquery.dataViewer',
      'roles/bigquery.connectionUser',
    ]);
  }

  // Get labels from current stack and apply to all resources
  setDefaultLabelsForAllResources();

  // Override current stack with test config

  const bqDifferentDataformResource =
    pipelineProperties.runnerOnDifferentProject && stack === 'shofifi'; // On development testing it manually using BQ UI

  const dataformProject = bqDifferentDataformResource
    ? pipelineProperties.runnerOnDifferentProject
    : projectId;
  const dataformStack = bqDifferentDataformResource
    ? pipelineProperties.runnerOnDifferentProject
    : stack;

  const chronosStateStackRef = new pulumi.StackReference(`triplewhale/chronos-state/${stack}`);
  const chronosStateServiceUrlOutput = chronosStateStackRef.getOutput('serviceUrl');
  if (!outputDataModel.skip) {
    const tableArgs = buildTableArgs({
      schema: outputDataModel.schema,
      clusterings: outputDataModel.clusterings,
      labels: pipelineProperties.pipelineLabels,
      partitioning: outputDataModel.partitioning,
      rangePartitioning: outputDataModel.rangePartitioning,
    });

    for (var table of [
      outputDataModel.outputTableName || pipelineId,
      ...outputDataModel.additionalOutputTables,
    ]) {
      const t = buildTables({
        latestConfig:{
          createTableOutputLatest: outputDataModel.createTableOutputLatest
        },
        viewPublicConfig: {
          createViewOutputPublic: outputDataModel.createViewOutputPublic,
          publicViewAdditionalSQL: outputDataModel.outputViewAdditionalSQL,
        },
        changesetConfig:{
          createTableOutputChangeset: outputDataModel.createTableOutputChangeset,
          changesetPartitionSize: outputDataModel.changesetPartitionSize,
          changesetClusterings: outputDataModel.changesetClusterings,
          changesetSchema: outputDataModel.changesetSchema,
          changesetTimePartitioning: outputDataModel.changesetTimePartitioning,
        },
        rootConfig:{
          createRootTable: outputDataModel.createRootTable,
          rootTableConfig
        },
        currentConfig:{
          createTableOutputDirty: currentConfig?.createTableOutputDirty
        },
        table,
        tableArgs,
        schema:outputDataModel.schema,
        labels: pipelineProperties.pipelineLabels
        }
      );  
      returns.latestTables = returns.latestTables || [];
      returns.latestTables[table] = t;
    }
  }

  // Set dataform branch. Use the one specified in test config. If none is specified:
  // (1) This is a DLCP pipeline, use the appropriate branch name.
  // (2) For legacy pipelines, 'develop' for staging and pre-prod, 'master' for prod.
  var dataformBranch =
    testConfig.forceDataformBranch ||
    pipelineProperties.dlcpGitRef ||
    (stack === 'shofifi' ? 'master' : 'develop'); // Legacy!

  // If the pipeline is running on a ideosyncratic stack (not staging, pre-prod or prod), ceate a new workspace
  if (!isCanonicalStack()) {
    const dataformWorkspaceId = getUniqueNameInProject(pipelineId) as string;
    new pulumiGoogleNative.dataform.v1beta1.Workspace('workspace', {
      repositoryId: getDataformRepositoryNameForProject(dataformStack),
      workspaceId: dataformWorkspaceId,
    }); // TODO push branch. options: 1) trigger gcp to push branch. 2) user manually pushes branch. 3) create branch in github, then they will connect on their own
    dataformBranch = dataformWorkspaceId;
  }

  // Create and configure workflow
  const dirname = __dirname.replace('/pulumi/module/', '/pulumi/src/');

  const workflowDefinition = fs.readFileSync(resolve(dirname + '/cdcWorkflow.yaml'), 'utf8');
  const workflow = new gcp.workflows.Workflow('workflow', {
    name: getUniqueNameInProject(`dataland-pipeline-${pipelineId}`),
    sourceContents: workflowDefinition,
    serviceAccount: serviceAccount.email,
    labels: { ...pipelineProperties.pipelineLabels },
  });

  // pulumi does not currently expose a way to get the workflow execution URL. See ticket linked below.
  // However, we can construct it ourselves based on the google docs, linked in that ticket
  // https://github.com/pulumi/pulumi-gcp/issues/553
  const workflowUri = pulumi.interpolate`https://workflowexecutions.googleapis.com/v1/projects/${projectId}/locations/${location}/workflows/${workflow.name}/executions`;

  const workflowArgs = {
    dataformRepositoryId: getDataformRepositoryIdForProject(dataformStack, dataformProject),
    pipeline: pipelineProperties?.pipelineName || pipelineId,
    serviceUrl: chronosStateServiceUrlOutput,
    inputBQDataset: inputDataModel?.inputDatasetName || rawDatasetId,
    inputBQTable: inputDataModel?.inputTableName || pipelineId,
    isDerived: inputDataModel.isDerived,
    dependencies: inputDataModel?.dependencies || {},
    recentBQDataset: recentDatasetId,
    publicBQDataset: latestDatasetId,
    changesetDatasetId,
    outputBQTable: outputDataModel.outputTableName || pipelineId,
    dataformBranch: dataformBranch,
    stack,
    bqProjectResource: bqDifferentDataformResource
      ? pipelineProperties?.runnerOnDifferentProject
      : projectId,
  };

  const currentWorkflowArgs = {
    dataformRepositoryId: getDataformRepositoryIdForProject(dataformStack, dataformProject),
    pipeline: `compaction`,
    serviceUrl: chronosStateServiceUrlOutput,
    inputBQDataset: inputDataModel?.inputDatasetName || rawDatasetId,
    inputBQTable: inputDataModel?.inputTableName || pipelineId,
    isDerived: false,
    dependencies: {},
    recentBQDataset: recentDatasetId,
    publicBQDataset: latestDatasetId,
    changesetDatasetId,
    outputBQTable: outputDataModel.outputTableName || pipelineId,
    dataformBranch: `dlcp-compaction${getDlcpTagByStack(stack)}`,
    stack,
    bqProjectResource: bqDifferentDataformResource
      ? pipelineProperties?.runnerOnDifferentProject
      : projectId,
    additionalValues: {
      tableToCompaction: pipelineId
    }
  };

  for (const conf of [
    { label: 'primary', schedule: schedulerConfig.schedule },
    ...schedulerConfig.subRuns,
  ]) {
    new gcp.cloudscheduler.Job(`job-${conf.label}`, {
      name: getUniqueNameInProject(`dataland-${pipelineId}-${conf.label}`),
      paused: schedulerConfig.paused || PAUSE_ALL_PIPELINES,
      httpTarget: {
        uri: workflowUri,
        httpMethod: 'POST',
        body: toBase64Output(
          toJSONOutput({
            argument: toJSONOutput({   ...(conf.label == 'compaction' ? currentWorkflowArgs : workflowArgs), 
            labels: [conf.label == 'compaction' ?pipelineId :conf.label], subrun: conf.label }),
            call_log_level: 'LOG_ERRORS_ONLY',
          })
        ),
        headers: {
          'Content-Type': 'application/json',
        },
        oauthToken: {
          serviceAccountEmail: serviceAccount.email,
        },
      },
      schedule: conf.schedule as pulumi.Input<string>,
    });
  }

  // Create subscriptions for the bucket and/or topic, if applicable
  for (const config of ingestSubscriptionConfig.bucketSubscriptionAndNotificationConfig) {
    createTopicSubscriptionNotification(
      config.bucketName,
      config.objectNamePrefix,
      ingestSubscriptionConfig.ingestEndPoint,
      chronosIngestService,
      deadLetterTopicId
    );
  }

  for (const config of ingestSubscriptionConfig.subscriptionConfig) {
    createSubscriptionToExistingTopic(
      config.topicName,
      projectId,
      config.labels,
      ingestSubscriptionConfig.ingestEndPoint,
      chronosIngestService,
      deadLetterTopicId
    );
  }
  return returns;
}

interface changesetConfig {
  createTableOutputChangeset?: boolean;
  changesetPartitionSize?: number;
  changesetClusterings?: Array<string>;
  changesetSchema? :Array<object>;
  changesetTimePartitioning?
}

export const changesetConfigDefault: changesetConfig ={
  createTableOutputChangeset: true,
  changesetPartitionSize: 50,
  changesetClusterings: null,
  changesetSchema: null,
  changesetTimePartitioning: null
}

interface rootConfig {
  createRootTable?: boolean;
  rootTableConfig?: rootTableConfig;
}

interface latestConfig {
  createTableOutputLatest?: boolean;
}

export const latestConfigDefault:latestConfig = {
  createTableOutputLatest: true
}

interface viewPublicConfig {
  createViewOutputPublic?: boolean;
  publicViewAdditionalSQL?: string;
}

export const viewPublicConfigDefault: viewPublicConfig = {
  createViewOutputPublic: true,
  publicViewAdditionalSQL: ''
}

interface currentConfig {
  createTableOutputDirty?: boolean;
}

interface BuildTablesArgs {
  latestConfig?: latestConfig;
  viewPublicConfig?: viewPublicConfig;
  changesetConfig?: changesetConfig;
  rootConfig?: rootConfig;
  currentConfig?: currentConfig;
  table?;
  tableArgs?;
  schema?;
  labels?;
  dependencies?: pulumi.Resource[];
}

export function buildTables(
  {
    latestConfig,
    viewPublicConfig,
    changesetConfig,
    rootConfig,
    currentConfig,
    table,
    tableArgs,
    schema,
    labels,
    dependencies = []
  }: BuildTablesArgs) {
  latestConfig = {...latestConfigDefault, ...latestConfig};
  viewPublicConfig = {...viewPublicConfigDefault, ...viewPublicConfig};
  changesetConfig = {...changesetConfigDefault, ...changesetConfig};
  rootConfig = {...rootTableConfigBase, ...rootConfig};

  const { overwritenTableArgs, requirePartitionFilter } = overridePartitioning(tableArgs);
  tableArgs = overwritenTableArgs;

  let latestTable: gcp.bigquery.Table;
  if (latestConfig.createTableOutputLatest) {
    latestTable = new gcp.bigquery.Table(
      `${table}-output-latest`,
      {
        datasetId: latestDatasetId,
        tableId: table,
        ...tableArgs,
        requirePartitionFilter,
      },
      {
        deleteBeforeReplace: true,
      }
    );
    if (viewPublicConfig.createViewOutputPublic) {
      buildView({
        pulumiResourceName: `${table}`, // TODO - change to ${table}-output-public. Need to make rename to all pipelines
        viewName: `${table}`,
        viewDataset: publicDatasetId,
        viewQuery: ({ projectId, datasetId, tableId }) =>
          `select * from \`${datasetId}.${tableId}\` ${viewPublicConfig.publicViewAdditionalSQL}`,
        viewQueryParamsObject: { datasetId: latestDatasetId, tableId: table },
        viewSchema: schema,
        dependencies: [latestTable, ...dependencies],
      });
    }
  }

  if (changesetConfig.createTableOutputChangeset) {
    function calculateClustering() {
      const clustering = ['proc_id'];
      const partitioningField =
        (tableArgs['timePartitioning'] || tableArgs['rangePartitioning'])?.field ?? null;
      if (partitioningField) clustering.push(partitioningField);
      if (tableArgs.clusterings)
        clustering.push(...tableArgs.clusterings.filter((col) => !clustering.includes(col)));
      return [...clustering].splice(0, 4);
    }
    const clusteringChangeset = changesetConfig.changesetClusterings || calculateClustering();
    
    let configuration = {
      datasetId: changesetDatasetId,
      tableId: table,
      schema: JSON.stringify(asBqSchema(changesetConfig.changesetSchema || schema)),
      clusterings: clusteringChangeset,
      labels: { ...labels },
    };
    if(changesetConfig.changesetTimePartitioning) {configuration['timePartitioning'] = changesetConfig.changesetTimePartitioning;}
    else{
    const start = 10000;
    const interval = Math.max(changesetConfig.changesetPartitionSize, 100);
    const maxPartition = start - 1 + interval * 4000;
    if (interval < 2000) {
      configuration['rangePartitioning'] = {
        field: 'proc_id',
        range: {
          end: maxPartition,
          interval,
          start,
        },
      };
    }
  }
    new gcp.bigquery.Table(`${table}-output-change-track`, configuration, {
      deleteBeforeReplace: true,
    });
  }
  if (rootConfig.createRootTable){

    const rootSchema = [...rootTableConfigBase.schema, ...(rootConfig.rootTableConfig?.schema || schema)];
    const colsName = rootSchema.map(col => col.name)

    const baseClusterings = rootTableConfigBase.clusterings.filter(field => colsName.includes(field))

    const additionalClusterings = rootConfig.rootTableConfig?.clusterings? rootConfig.rootTableConfig.clusterings : tableArgs.clusterings;

    const uniqueClustering = additionalClusterings.filter((value) => {
      return !baseClusterings.includes(value);
  });

  const rootClusterings = [...(baseClusterings || []), ...(uniqueClustering || [])].slice(0, 4);

    new gcp.bigquery.Table(`${table}-root`, {
      datasetId: rootDatasetId,
      tableId: table,
      schema: JSON.stringify(rootSchema),
      rangePartitioning: {
        field: rootTableConfigBase.partitioning,
        range: {
          start: 1,
          end: 1500,
          interval: 1,
        },
      },
      requirePartitionFilter: true,
      clusterings: rootClusterings,
    });
  }

  if (currentConfig?.createTableOutputDirty){
    const filteredSchema = schema.filter(field => tableArgs.clusterings.includes(field.name));
    const dirtySchema = [ ...filteredSchema, ...baseDirtySchema];
    tableArgs.schema = JSON.stringify(dirtySchema);
    new gcp.bigquery.Table(`dirty-${table}`, 
    {
      datasetId: currentDatasetId,
      tableId: `dirty-${table}`,
      tableConstraints:{
        primaryKey: {
          columns: [...tableArgs.clusterings],
      },
      },
      ...tableArgs,
    },
    {
      deleteBeforeReplace: true,
    }
  );
}
return latestTable;
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
