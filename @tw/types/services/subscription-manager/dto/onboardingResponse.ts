import { onboardingTaskInfo } from './onboardingTaskInfo';

export declare type onboardingResponse = {
  shop: string;
  user: string;
  completePercentage: number;
  completeCount: number;
  taskCount: number;
  recomendedTasks: onboardingTaskInfo[];
  criticalTasks: onboardingTaskInfo[];
};
