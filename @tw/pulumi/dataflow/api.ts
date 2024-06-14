import { GoogleAuth } from 'google-auth-library';
import { JobsV1Beta3Client } from '@google-cloud/dataflow';
import axios from 'axios';
import { getConfigs } from '../utils';

export async function callApi(url: string) {
  const authClient = new GoogleAuth();
  const accessToken = await authClient.getAccessToken();
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  return response;
}

type Job = {
  name: string;
  id: string;
  createTime: string;
  dataflowJobDetails: { sdkVersion: {} };
};

// currently no sdk support for this
export async function getMostRecentJob(): Promise<Job | undefined> {
  const { projectId, serviceId, location } = getConfigs();
  const response = await callApi(
    `https://datapipelines.googleapis.com/v1/projects/${projectId}/locations/${location}/pipelines/${serviceId}/jobs`
  );
  return response.data.jobs[0];
}

export async function isJobActive(job: Job): Promise<boolean> {
  const { projectId, location } = getConfigs();
  const dataflowClient = new JobsV1Beta3Client();
  const jobInfo = await dataflowClient.getJob({
    projectId,
    location,
    jobId: job.id,
  });
  return jobInfo[0].currentState === 'JOB_STATE_RUNNING';
}

// currently no sdk support for this
export async function getPipeline(): Promise<boolean> {
  const { projectId, serviceId, location } = getConfigs();
  try {
    await callApi(
      `https://datapipelines.googleapis.com/v1/projects/${projectId}/locations/${location}/pipelines/${serviceId}`
    );
    return true;
  } catch (e) {
    return false;
  }
}

type ListJobMessagesResponse = {
  jobMessages: [];
  nextPageToken: string;
  autoscalingEvents: {
    targetNumWorkers?: string;
    currentNumWorkers?: string;
    eventType: string;
    description: {};
    time: string;
    workerPool: string;
  }[];
};

// the sdk function for this, listJobMessages, does not return what we need - IListJobMessagesResponse (client is beta)
export async function getCurrentNumWorkers(jobId: string): Promise<number | undefined> {
  const { projectId, location } = getConfigs();
  let pageToken;
  const autoscalingEvents = [];
  do {
    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const response = await callApi(
      `https://dataflow.googleapis.com/v1b3/projects/${projectId}/locations/${location}/jobs/${jobId}/messages${pageTokenParam}`
    );
    const data: ListJobMessagesResponse = response.data;
    pageToken = data.nextPageToken;
    if (data.autoscalingEvents) {
      autoscalingEvents.push(...data.autoscalingEvents);
    }
  } while (pageToken);
  autoscalingEvents.reverse(); // most recent last -> most recent first

  const mostRecentNumWorkers = autoscalingEvents.find((event) => event.currentNumWorkers);
  if (mostRecentNumWorkers) {
    return Number(mostRecentNumWorkers.currentNumWorkers);
  }
}
