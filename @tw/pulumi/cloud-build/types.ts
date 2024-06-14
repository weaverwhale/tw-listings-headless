import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

export type CreateBuildTriggerArgs = {
  name?: string;
  workerPool?: string;
  runtime?: 'node' | 'python' | 'clojure' | 'beam-python';
  moreSteps?: gcp.types.input.cloudbuild.TriggerBuildStep[];
  k8s?: { clusters?: { name: string; location: string }[]; gpu?: boolean };
  dockerfileRun?: string;
  dockerfileCacheRun?: string;
  dockerBuildEnvs?: pulumi.Input<string>[];
  machineType?: 'E2_HIGHCPU_8' | 'E2_HIGHCPU_32';
  baseDir?: string;
  downloadFilesFromGcs?: { bucket: string; filename: string }[];
  runtimeBaseImage?: pulumi.Input<string>;
};
