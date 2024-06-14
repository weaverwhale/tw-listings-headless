import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { createCronJobAlert } from './alerts';
import { getAudience, getFullUrl, getPubsubTopicId, getUniqueNameInProject } from '../utils';
import { getConfigs } from '../utils/getConfigs';
import { serviceTarget } from '../types';
import { getServiceAccountForService } from '../utils/getServiceAccount';
import { toBase64Output, toJSONOutput } from '../pulumi-utils';

export function createCronJob(args: {
  name: string;
  schedule: string;
  httpTarget?: {
    endpoint: pulumi.Input<string>;
    httpMethod?: 'GET' | 'POST';
    service: serviceTarget;
  };
  pubsubTarget?: {
    topicName: pulumi.Input<string>;
    attributes?: Record<any, any>;
  };
  generalHttpTarget?: {
    httpMethod: pulumi.Input<string>;
    serviceAccount?: pulumi.Input<string>;
    url: pulumi.Input<string>;
  };
  workflowTarget?: {
    workflowName: pulumi.Input<string>;
  };
  retryCount?: number;
  body?: Record<any, any>;
  paused?: boolean;
}) {
  const {
    name,
    httpTarget,
    generalHttpTarget,
    workflowTarget,
    schedule,
    retryCount = 0,
    body,
    pubsubTarget,
    paused = false,
  } = args;
  if ([httpTarget, pubsubTarget, generalHttpTarget, workflowTarget].filter(Boolean).length !== 1) {
    throw new Error('Exactly one of the target parameters must be provided.');
  }
  const { location, projectId } = getConfigs();
  const jobArgs: gcp.cloudscheduler.JobArgs = {
    name: getUniqueNameInProject(name),
    schedule: schedule,
    region: location,
    paused,
  };
  if (generalHttpTarget) {
    jobArgs.httpTarget = {
      body: '',
      httpMethod: generalHttpTarget.httpMethod || 'POST',
      oauthToken: {
        serviceAccountEmail: generalHttpTarget.serviceAccount,
      },
      uri: generalHttpTarget.url,
    };
  }
  if (httpTarget) {
    jobArgs.httpTarget = {
      body: '',
      httpMethod: httpTarget.httpMethod || 'POST',
      oidcToken: {
        audience: getAudience(httpTarget.service),
        serviceAccountEmail: getServiceAccountForService(),
      },
      uri: getFullUrl(httpTarget.service, httpTarget.endpoint),
    };
    jobArgs.attemptDeadline = '1800s';
  }
  if (workflowTarget) {
    jobArgs.httpTarget = {
      body: '',
      httpMethod: 'POST',
      oauthToken: {
        serviceAccountEmail: getServiceAccountForService(),
      },
      uri: pulumi.interpolate`https://workflowexecutions.googleapis.com/v1/projects/${projectId}/locations/${location}/workflows/${workflowTarget.workflowName}/executions`,
    };
  }
  if (pubsubTarget) {
    jobArgs.pubsubTarget = {
      topicName: getPubsubTopicId(pubsubTarget.topicName),
      attributes: pubsubTarget.attributes || { from: 'pulumi' },
    };
  }
  if (body) {
    if (httpTarget || generalHttpTarget) {
      (jobArgs.httpTarget as any).body = Buffer.from(JSON.stringify(body)).toString('base64');
      (jobArgs.httpTarget as any).headers = {
        'Content-Type': 'application/json',
      };
    } else if (workflowTarget) {
      (jobArgs.httpTarget as any).body = toBase64Output(
        toJSONOutput({
          argument: toJSONOutput(body),
        })
      );
    } else if (pubsubTarget) {
      (jobArgs.pubsubTarget as any).data = Buffer.from(JSON.stringify(body)).toString('base64');
    }
  }
  if (retryCount) {
    jobArgs.retryConfig = { retryCount };
  }
  const job = new gcp.cloudscheduler.Job(name, jobArgs);
  createCronJobAlert(name);
  return job;
}
