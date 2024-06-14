import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { getConfigs, getUniqueNameInProject } from '../utils';
import { GoogleCloudWorkflows } from './schema';
import { toJSONOutput } from '../pulumi-utils';
import { createDatadogMonitor } from '../datadog';
import { isProduction } from '../constants';

export const CHILD_WORKFLOW_PREDICATE = 'childWorkflowPredicate';
export const DATAFORM_PREDICATE = 'dataformInvocationPredicate';

export function createWorkflow(args: {
  name: string;
  workflow: GoogleCloudWorkflows;
  serviceAccountEmail: pulumi.Input<string>;
  forceMonitor?: boolean;
}) {
  const { name = 'workflow', workflow, serviceAccountEmail, forceMonitor = false } = args;
  const { projectId } = getConfigs();
  const workflowName = getUniqueNameInProject(name);

  if (isProduction || forceMonitor) {
    createDatadogMonitor({
      id: `workflow-errors-${workflowName}`,
      sendOnAlert: false,
      settings: {
        name: `<${workflowName}> Workflow Failed Executions`,
        query: `sum(last_1h):sum:gcp.workflows.finished_execution_count{workflow_id:${workflowName}, project_id:${projectId}, status:failed}.as_count() > 0`,
        type: 'query alert',
        monitorThresholds: {
          critical: '0',
        },
      },
    });
  }

  workflow[CHILD_WORKFLOW_PREDICATE] = {
    params: ['e'],
    steps: [
      {
        checkForError: {
          switch: [
            {
              condition: '${"OperationError" in e.tags}',
              return: true,
            },
            {
              condition: true,
              return: false,
            },
          ],
        },
      },
    ],
  };

  workflow[DATAFORM_PREDICATE] = {
    params: ['e'],
    steps: [
      {
        checkForError: {
          switch: [
            {
              // http.default_retry_predicate with 4xx added
              condition:
                '${(e.code >= 400 and e.code < 500) or e.code == 502 or e.code == 503 or e.code == 504 or "ConnectionError" in e.tags or "ConnectionFailedError" in e.tags or "TimeoutError" in e.tags}',
              return: true,
            },
            {
              condition: true,
              return: false,
            },
          ],
        },
      },
    ],
  };

  return new gcp.workflows.Workflow(name, {
    name: workflowName,
    sourceContents: toJSONOutput(workflow, true),
    serviceAccount: serviceAccountEmail,
  });
}
