import { TASK_STATUS, onboardingTask } from './onboardingTask';

export declare type onboardingTaskInfo = onboardingTask & {
  status: TASK_STATUS;
  statusText: string;
  info?: any;
  skipped?: boolean;
};
