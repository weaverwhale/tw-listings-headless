import * as pulumi from '@pulumi/pulumi';
import { CHILD_WORKFLOW_PREDICATE } from './createWorkflow';
import { Step } from './schema/workflows';
import { getConfigs } from '../utils';

export type WorkflowInvocation = {
  name: string;
  workflowId: pulumi.Input<string>;
  workflowArgs?: any;
  resultKey?: string;
  exceptionKey?: string;
  failOnChildFailure?: boolean;
  maxRetries?: number;
  timeout?: number; // seconds
};

export function invokeWorkflows(args: { name; workflowInvocations: WorkflowInvocation[] }): {
  [k: string]: Step;
} {
  const { name, workflowInvocations } = args;
  return {
    [name]: {
      parallel: {
        shared: workflowInvocations
          .map((workflowInvocation) => workflowInvocation.resultKey)
          .filter(Boolean),
        branches: workflowInvocations.map((workflowInvocation) =>
          invokeWorkflow(workflowInvocation)
        ),
      },
    },
  };
}

export function invokeWorkflow(args: WorkflowInvocation): {
  [k: string]: Step;
} {
  const {
    name,
    workflowId,
    workflowArgs,
    resultKey,
    exceptionKey,
    failOnChildFailure = true,
    maxRetries = 5,
    timeout = 31536000, // max. 1 year
  } = args;
  const { projectId, location } = getConfigs();
  const tempResultKey = `${name.replaceAll('-', '_')}_tempResult`;
  const assignStep = exceptionKey
    ? [
        {
          [`${name}-assign`]: {
            assign: [
              {
                [exceptionKey]: '',
                [tempResultKey]: '',
              },
            ],
          },
        },
      ]
    : [];

  // @ts-ignore
  return {
    [name]: {
      steps: [
        ...assignStep,
        {
          [`${name}-invoke`]: {
            try: {
              try: {
                call: 'googleapis.workflowexecutions.v1.projects.locations.workflows.executions.create',
                args: {
                  parent: `projects/${projectId}/locations/${location}/workflows/${workflowId}`,
                  body: {
                    argument: JSON.stringify(workflowArgs),
                  },
                  connector_params: {
                    timeout,
                  },
                },
                result: tempResultKey,
              },
              retry: {
                predicate: '${http.default_retry_predicate}',
              },
            },
            retry: {
              predicate: `\${${CHILD_WORKFLOW_PREDICATE}}`,
              max_retries: maxRetries,
            },
            except: {
              as: 'e',
              steps: failOnChildFailure
                ? [
                    {
                      [`${name}-raise`]: {
                        raise: '${e}',
                      },
                    },
                  ]
                : [
                    {
                      [`${name}-handleFaillure`]: {
                        call: 'sys.log',
                        args: {
                          data: { [`${name} - workflow failed`]: '${e}' },
                        },
                      },
                    },
                    {
                      [`${name}-assignFailure`]: {
                        assign: [
                          {
                            [exceptionKey]: '${e}',
                          },
                        ],
                      },
                    },
                  ],
            },
          },
        },
        {
          [`${name}-logExecutionUrl`]: {
            call: 'sys.log',
            args: {
              text: `\${"child workflow started: https://console.cloud.google.com/workflows/workflow/${location}/${workflowId}/execution/" + text.find_all_regex(${tempResultKey}.name, "[^/]+$")[0].match + "?project=${projectId}"}`,
            },
          },
        },
        {
          [`${name}-assignResult`]: {
            assign: [
              {
                [resultKey]: `\${json.decode(${tempResultKey}.result)}`,
              },
            ],
          },
        },
      ],
    },
  };
}
