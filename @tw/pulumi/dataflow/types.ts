import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export type dataflowParameters = Record<string, pulumi.Input<string>>;

export type EnvironmentArgs =
  | gcp.types.input.dataflow.PipelineWorkloadDataflowFlexTemplateRequestLaunchParameterEnvironment
  | gcp.types.input.dataflow.PipelineWorkloadDataflowLaunchTemplateRequestLaunchParametersEnvironment;
