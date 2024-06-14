import { google } from '@google-cloud/dataform/build/protos/protos';
type ICompilationResult = google.cloud.dataform.v1alpha2.ICompilationResult;
type IWorkflowInvocation = google.cloud.dataform.v1alpha2.IWorkflowInvocation;
type ITarget = google.cloud.dataform.v1alpha2.ITarget;
import { getConfigs, getDataformRepoId } from '../utils';
import { Args, Step } from './schema/workflows';
import { DATAFORM_PREDICATE } from './createWorkflow';
import { GCPServiceAccount } from '../iam';

// assigns a dict to results variable of the form:
// {workflowInvocationName: workflowInvocationState}
// https://cloud.google.com/dataform/reference/rest/v1beta1/projects.locations.repositories.workflowInvocations#State
export function dataformJob(args: {
  name: string;
  dataformRepository: string;
  branch: string;
  dataformVars: {};
  outputDatasetName: string;
  target: ITarget;
  resultsKey: string;
  serviceAccount: GCPServiceAccount;
}): { [k: string]: Step } {
  const {
    name,
    branch,
    dataformVars,
    dataformRepository,
    target,
    resultsKey,
    outputDatasetName,
    serviceAccount,
  } = args;
  const { projectId } = getConfigs();
  const dataformRepoUrl = `https://dataform.googleapis.com/v1beta1/${getDataformRepoId(
    projectId,
    dataformRepository
  )}`;

  const compilationRequest: ICompilationResult = {
    gitCommitish: branch,
    codeCompilationConfig: {
      defaultDatabase: projectId,
      defaultSchema: outputDatasetName,
      vars: dataformVars,
    },
  };

  const compilationResultKey = `${name}CompilationResult`;
  const invocationResultKey = `${name}InvocationResult`;
  const invocationRequest: IWorkflowInvocation = {
    compilationResult: `\${${compilationResultKey}.body.name}`,
    invocationConfig: {
      includedTargets: [target],
      transitiveDependenciesIncluded: true,
      // @ts-ignore
      serviceAccount: serviceAccount.email,
    },
  };

  return {
    [name]: {
      steps: [
        {
          [`${name}-createCompilationResult`]: {
            try: {
              call: 'http.post',
              args: {
                url: `${dataformRepoUrl}/compilationResults`,
                auth: {
                  type: 'OAuth2',
                },
                body: compilationRequest as Args['body'],
              },
              result: compilationResultKey,
            },
            retry: {
              predicate: `\${${DATAFORM_PREDICATE}}`,
              max_retries: 10,
              backoff: {
                initial_delay: 2,
                max_delay: 60,
                multiplier: 2,
              },
            },
          },
        },
        {
          [`${name}-invokeDataform`]: {
            try: {
              call: 'http.post',
              args: {
                url: `${dataformRepoUrl}/workflowInvocations`,
                auth: {
                  type: 'OAuth2',
                },
                body: invocationRequest as Args['body'],
              },
              result: invocationResultKey,
            },
            retry: {
              predicate: `\${${DATAFORM_PREDICATE}}`,
              max_retries: 10,
              backoff: {
                initial_delay: 2,
                max_delay: 60,
                multiplier: 2,
              },
            },
          },
        },
        {
          [`${name}-logExecutionUrl`]: {
            call: 'sys.log',
            args: {
              severity: 'INFO',
              text: `\${"dataform execution URL: https://console.cloud.google.com/bigquery/dataform/locations/" + sys.get_env("GOOGLE_CLOUD_LOCATION") + text.find_all_regex(${invocationResultKey}.body.name, "/repositories/[^/]+/")[0].match + "workflows" + text.find_all_regex(${invocationResultKey}.body.name, "/[^/]+$")[0].match + "?project=${projectId}"}`,
            },
          },
        },
        {
          [`${name}-initSleep`]: {
            assign: [
              {
                [`${name}_sleepSeconds`]: 5,
              },
            ],
          },
        },
        {
          [`${name}-awaitDataformCompletion`]: {
            steps: [
              {
                [`${name}-dataformCompletionSleep`]: {
                  call: 'sys.sleep',
                  args: {
                    seconds: `\${${name}_sleepSeconds}`,
                  },
                },
              },
              {
                [`${name}-incrementSleep`]: {
                  assign: [
                    {
                      [`${name}_sleepSeconds`]: `\${math.min(${name}_sleepSeconds * 1.5, 1800)}`, // max 30 minutes
                    },
                  ],
                },
              },
              {
                [`${name}-getDataformCompletion`]: {
                  try: {
                    call: 'http.get',
                    args: {
                      url: `\${"https://dataform.googleapis.com/v1beta1/" + ${invocationResultKey}.body.name}`,
                      auth: {
                        type: 'OAuth2',
                      },
                    },
                    result: invocationResultKey,
                  },
                  retry: {
                    predicate: `\${${DATAFORM_PREDICATE}}`,
                    max_retries: 10,
                    backoff: {
                      initial_delay: 2,
                      max_delay: 60,
                      multiplier: 2,
                    },
                  },
                },
              },
              {
                [`${name}-checkDataformCompletion`]: {
                  switch: [
                    {
                      condition: `\${${invocationResultKey}.body.state in ["RUNNING", "CANCELING"]}`,
                      next: `${name}-awaitDataformCompletion`,
                    },
                    {
                      condition: `\${${invocationResultKey}.body.state in ["FAILED", "CANCELLED"]}`,
                      raise: `\${"Dataform workflow failed: " + ${invocationResultKey}.body.name + ": " + ${invocationResultKey}.body.state}`,
                    },
                    {
                      condition: `\${${invocationResultKey}.body.state == "SUCCEEDED"}`,
                      assign: [
                        {
                          [resultsKey]: {
                            [`\${${invocationResultKey}.body.name}`]: `\${${invocationResultKey}.body.state}`,
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}
