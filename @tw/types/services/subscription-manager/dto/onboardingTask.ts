import { SubscriptionFeature } from "../../../types";
import { FeatureFlag } from "@tw/feature-flag-system/module/types";

export enum TASK_TYPE {
  CRITICAL = "CRITICAL",
  RECOMENDED = "RECOMENDED",
}

export enum TASK_LEVEL {
  SHOP = "SHOP",
  USER = "USER",
  SHOP_USER = "SHOP_USER",
}

export enum TASK_STATUS {
  COMPLETE = "Complete",
  UNCOMPLETE = "Uncomplete",
  UNKNOWN = "Unknown",
}

export declare type onboardingTask = {
  id: string;
  name: string;
  description: string;
  order: number;
  type: TASK_TYPE;
  completeText: string;
  uncompleteText: string;
  level: TASK_LEVEL;
  action: string;
  lockedByFeature?: SubscriptionFeature | FeatureFlag; // TODO: Deprecate - clean up shop docs with this field - no longer in use
  lockedByFeatureFlag?: FeatureFlag;
};
