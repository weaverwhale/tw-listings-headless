import { createAuthProxyUrl } from '../utils';
import { Step } from './schema/workflows';

const devopsService = createAuthProxyUrl('devops', true);

export function k8Jobs(args: {
  name: string;
  // either the number of jobs to run (number)
  // or the name of a variable containing the number of jobs to run (string)
  numJobs?: number | string;
  // ${resultsKey} - will contain the names of all jobs
  // ${resultsKey}Completed - will contain the names of successfully completed jobs
  // ${resultsKey}Failed - will contain the names of jobs that failed
  resultsKey: string;
  jobNumKey: string;
  failWorkflowOnJobFailure?: boolean;
  config: {
    job: any;
    context: string;
    args?: string[];
  };
}): { [k: string]: Step } {
  const { name, numJobs, resultsKey, jobNumKey, failWorkflowOnJobFailure = true, config } = args;

  const completedVariable = `${resultsKey}Completed`;
  const failedVariable = `${resultsKey}Failed`;

  const getJobResultKey = `${name}GetJobResult`;
  const startJobsResultKey = `${name}StartJobsResult`;

  const jobNameKey = `${name}JobName`;
  return {
    [name]: {
      steps: [
        {
          [`${name}-initJobNames`]: {
            assign: [
              {
                [resultsKey]: [],
              },
              {
                [completedVariable]: [],
              },
              {
                [failedVariable]: [],
              },
            ],
          },
        },
        {
          [`${name}-logStartingJobs`]: {
            call: 'sys.log',
            args: {
              text: `\${"${name} - starting " + ${numJobs} + " jobs"}`,
            },
          },
        },
        {
          [`${name}-startJobs`]: {
            parallel: {
              shared: [resultsKey],
              for: {
                value: jobNumKey,
                range: `\${[0, ${numJobs}-1]}`,
                steps: [
                  {
                    [`${name}-startJob`]: {
                      try: {
                        call: 'http.post',
                        args: {
                          url: `${devopsService}/k8s/create-job`,
                          auth: {
                            type: 'OIDC',
                            audience: 'devops',
                          },
                          body: config,
                        },
                        result: startJobsResultKey,
                      },
                      retry: {
                        predicate: '${http.default_retry_predicate}',
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
                    [`${name}-appendJobName`]: {
                      assign: [
                        {
                          [resultsKey]: `\${list.concat(${resultsKey},${startJobsResultKey}.body.body.metadata.name)}`,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
        {
          [`${name}-logJobNames`]: {
            call: 'sys.log',
            args: {
              data: { [`${name} - jobs started`]: `\${${resultsKey}}` },
            },
          },
        },
        {
          [`${name}-waitForJobs`]: {
            parallel: {
              shared: [completedVariable, failedVariable],
              for: {
                value: jobNameKey,
                in: `\${${resultsKey}}`,
                steps: [
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
                    [`${name}-getK8sJob`]: {
                      try: {
                        call: 'http.post',
                        args: {
                          url: `${devopsService}/k8s/get-job`,
                          auth: {
                            type: 'OIDC',
                            audience: 'devops',
                          },
                          body: {
                            jobName: `\${${jobNameKey}}`,
                            context: config.context,
                            namespace: config.job.metadata.namespace,
                          },
                        },
                        result: getJobResultKey,
                      },
                      retry: {
                        predicate: '${http.default_retry_predicate}',
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
                    [`${name}-checkResult`]: {
                      switch: [
                        {
                          condition: `\${${getJobResultKey}.body.completed}`,
                          steps: [
                            {
                              [`${name}-logSuccess`]: {
                                call: 'sys.log',
                                args: {
                                  text: `\${"Job completed: " + ${jobNameKey}}`,
                                },
                              },
                            },
                            {
                              [`${name}-assignSuccess`]: {
                                assign: [
                                  {
                                    [completedVariable]: `\${list.concat(${completedVariable},${jobNameKey})}`,
                                  },
                                ],
                              },
                            },
                          ],
                        },
                        {
                          condition: `\${${getJobResultKey}.body.failed}`,
                          steps: [
                            {
                              [`${name}-logFailure`]: {
                                call: 'sys.log',
                                args: {
                                  text: `\${"Job failed: " + ${jobNameKey}}`,
                                },
                              },
                            },
                            {
                              [`${name}-assignFailure`]: {
                                assign: [
                                  {
                                    [failedVariable]: `\${list.concat(${failedVariable},${jobNameKey})}`,
                                  },
                                ],
                              },
                            },
                          ],
                        },
                        {
                          condition: true,
                          steps: [
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
                              [`${name}-k8sleep`]: {
                                call: 'sys.sleep',
                                args: {
                                  seconds: `\${${name}_sleepSeconds}`,
                                },
                                next: `${name}-getK8sJob`,
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
          },
        },
        {
          [`${name}-maybeFail`]: {
            switch: [
              {
                condition: `\${${failWorkflowOnJobFailure} and len(${failedVariable}) > 0}`,
                steps: [
                  {
                    [`${name}-fail`]: {
                      raise: {
                        message: `${name} - one or more jobs failed`,
                        completedVariable: `\${${completedVariable}}`,
                        failedVariable: `\${${failedVariable}}`,
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  };
}
