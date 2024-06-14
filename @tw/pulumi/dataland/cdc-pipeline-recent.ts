import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as pulumiGoogleNative from "@pulumi/google-native";
import { resolve } from "path";
import { getConfigs, getUniqueNameInProject } from "../utils";
import { toBase64Output, toJSONOutput } from "../pulumi-utils";
import {
  recentDatasetId,
  changesetDatasetId,
  latestDatasetId,
  rawDatasetId,
  getDataformRepositoryNameForProject,
  getDataformRepositoryIdForProject,
} from "./names";
import { addRolesToServiceAccount } from "../iam";
import { createServiceAccount } from "../service";
import {
  isCanonicalStack,
  setDefaultLabelsForAllResources,
  buildTableArgs,
  Projects,
} from "./utils";

import {
  schedulerConfigArgs,
  schedulerConfigArgsDefault,
  inputDataModelArgs,
  inputDataModelDefault,
  testConfigArgs,
  testConfigDefault,
  pipelinePropertiesArgs,
  pipelinePropertiesDefault,
} from "./cdc-pipeline";

interface CdcRecentPipelineArgs {
  pipelineProperties?: pipelinePropertiesArgs;
  schedulerConfig?: schedulerConfigArgs;
  schema: Array<Object>;
  partitioning;
  clusterings: Array<string>;
  inputDataModel?: inputDataModelArgs;
  testConfig?: testConfigArgs;
}

export function createRecentCdcPipeline({
  pipelineProperties, // Params with a pipeline-wide effect (name, labels)
  schedulerConfig, // Scheduling configuration for the pipeline and its subruns
  schema,
  partitioning,
  clusterings, // Output data model schema and datasets
  inputDataModel, // Configuration for input datasets, used in pipelines with an upstream pipeline.
  testConfig, // Output data model schema and datasets
}: CdcRecentPipelineArgs) {
  // Set defaults for nestesd object arguments
  pipelineProperties = { ...pipelinePropertiesDefault, ...pipelineProperties };
  schedulerConfig = { ...schedulerConfigArgsDefault, ...schedulerConfig };
  inputDataModel = { ...inputDataModelDefault, ...inputDataModel };
  testConfig = { ...testConfigDefault, ...testConfig };

  const { serviceId: pipelineId, stack, projectId, location } = getConfigs();

  let serviceAccountEmail;
  if (stack === "pre-prod") {
    serviceAccountEmail = `dl-${pipelineId}@${projectId}.iam.gserviceaccount.com`;
  } else {
    const { serviceAccount } = createServiceAccount({
      name: `dl-${pipelineId}`,
      roles: [`projects/${projectId}/roles/datalandService`],
    });
    serviceAccountEmail = serviceAccount.email;

    if (stack === "shofifi") {
      addRolesToServiceAccount(serviceAccount, Projects.DataLandOps, [
        "roles/dataform.editor",
        "roles/bigquery.jobUser",
        "roles/bigquery.dataOwner",
        "roles/bigquery.resourceViewer",
      ]);
      addRolesToServiceAccount(serviceAccount, "triple-whale-ops", [
        "roles/dataform.editor",
        "roles/bigquery.jobUser",
        "roles/bigquery.dataOwner",
        "roles/bigquery.resourceViewer",
      ]);
    }
    if (stack === "triple-whale-staging") {
      addRolesToServiceAccount(serviceAccount, "shofifi", [
        "roles/bigquery.dataViewer",
        "roles/bigquery.connectionUser",
      ]);
      addRolesToServiceAccount(serviceAccount, "triple-whale-ops", [
        "roles/bigquery.dataViewer",
      ]);
    }
  }

  // Get labels from current stack and apply to all resources
  setDefaultLabelsForAllResources();

  // Override current stack with test config

  const bqDifferentDataformResource =
    pipelineProperties.runnerOnDifferentProject && stack === "shofifi"; // On development testing it manually using BQ UI

  const dataformProject = bqDifferentDataformResource
    ? pipelineProperties.runnerOnDifferentProject
    : projectId;
  const dataformStack = bqDifferentDataformResource
    ? pipelineProperties.runnerOnDifferentProject
    : stack;

  const chronosStateStackRef = new pulumi.StackReference(
    `triplewhale/chronos-state/${stack}`
  );
  const chronosStateServiceUrlOutput =
    chronosStateStackRef.getOutput("serviceUrl");

  const tableArgs = buildTableArgs({
    schema: schema,
    clusterings: clusterings,
    labels: pipelineProperties.pipelineLabels,
    partitioning: partitioning,
  });

  new gcp.bigquery.Table(`${pipelineId}-output-recent`, {
    ...tableArgs,
    tableId: pipelineId,
    datasetId: recentDatasetId,
  });

  // Set dataform branch. Use the one specified in test config. If none is specified:
  // (1) This is a DLCP pipeline, use the appropriate branch name.
  // (2) For legacy pipelines, 'develop' for staging and pre-prod, 'master' for prod.
  var dataformBranch =
    testConfig.forceDataformBranch ||
    pipelineProperties.dlcpGitRef ||
    (stack === "shofifi" ? "master" : "develop"); // Legacy!

  // If the pipeline is running on a ideosyncratic stack (not staging, pre-prod or prod), ceate a new workspace
  if (!isCanonicalStack()) {
    const dataformWorkspaceId = getUniqueNameInProject(pipelineId) as string;
    new pulumiGoogleNative.dataform.v1beta1.Workspace("workspace", {
      repositoryId: getDataformRepositoryNameForProject(dataformStack),
      workspaceId: dataformWorkspaceId,
    }); // TODO push branch. options: 1) trigger gcp to push branch. 2) user manually pushes branch. 3) create branch in github, then they will connect on their own
    dataformBranch = dataformWorkspaceId;
  }

  // Create and configure workflow
  const dirname = __dirname.replace("/pulumi/module/", "/pulumi/src/");

  const workflowDefinition = fs.readFileSync(
    resolve(dirname + "/cdcWorkflow.yaml"),
    "utf8"
  );
  const workflow = new gcp.workflows.Workflow("workflow", {
    name: getUniqueNameInProject(`dataland-pipeline-${pipelineId}`),
    sourceContents: workflowDefinition,
    serviceAccount: serviceAccountEmail,
    labels: { ...pipelineProperties.pipelineLabels },
  });
  // pulumi does not currently expose a way to get the workflow execution URL. See ticket linked below.
  // However, we can construct it ourselves based on the google docs, linked in that ticket
  // https://github.com/pulumi/pulumi-gcp/issues/553
  const workflowUri = pulumi.interpolate`https://workflowexecutions.googleapis.com/v1/projects/${projectId}/locations/${location}/workflows/${workflow.name}/executions`;

  const workflowArgs = {
    dataformRepositoryId: getDataformRepositoryIdForProject(
      dataformStack,
      dataformProject
    ),
    pipeline: pipelineProperties?.pipelineName || pipelineId,
    serviceUrl: chronosStateServiceUrlOutput,
    inputBQDataset: inputDataModel?.inputDatasetName || rawDatasetId,
    inputBQTable: inputDataModel?.inputTableName || pipelineId,
    isDerived: inputDataModel.isDerived,
    dependencies: inputDataModel?.dependencies || {},
    recentBQDataset: recentDatasetId,
    publicBQDataset: latestDatasetId,
    changesetDatasetId: changesetDatasetId,
    outputBQTable: pipelineId,
    dataformBranch: dataformBranch,
    stack,
    bqProjectResource: bqDifferentDataformResource
      ? pipelineProperties?.runnerOnDifferentProject
      : projectId,
  };
  for (const conf of [
    { label: "recent", schedule: schedulerConfig.schedule },
    ...schedulerConfig.subRuns,
  ]) {
    new gcp.cloudscheduler.Job(`job-${conf.label}`, {
      name: getUniqueNameInProject(`dataland-${pipelineId}-${conf.label}`),
      paused: schedulerConfig.paused,
      httpTarget: {
        uri: workflowUri,
        httpMethod: "POST",
        body: toBase64Output(
          toJSONOutput({
            argument: toJSONOutput({
              ...workflowArgs,
              labels: [conf.label],
              subrun: conf.label,
            }),
            call_log_level: "LOG_ERRORS_ONLY",
          })
        ),
        headers: {
          "Content-Type": "application/json",
        },
        oauthToken: {
          serviceAccountEmail: serviceAccountEmail,
        },
      },
      schedule: conf.schedule as pulumi.Input<string>,
    });
  }
}
