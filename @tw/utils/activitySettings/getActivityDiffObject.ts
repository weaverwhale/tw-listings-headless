import { deepDiff } from '../deepDiff';
import { ActivityDiff, ActivitySettings, ActivityType } from './types';

export const getActivityDiffObject = (oldObj: any, newObj: any): ActivityDiff => {
  const specificPaths: String[] = [];
  const changes = deepDiff(oldObj, newObj);
  const flatChanges = Object.entries(changes).map(([key, value]) => {
    return { field: key, from: value['from'], to: value['to'] };
  });
  const filteredChanges = flatChanges.filter((value) => {
    return !(
      (value['from'] === null && value['to'] == undefined) ||
      (value['to'] === null && value['from'] == undefined)
    );
  });
  if (filteredChanges.length > 0) {
    return {
      old: oldObj,
      new: newObj,
      changes: filteredChanges,
      activityType: ActivityType.UPDATED,
    };
  }
  return null;
};
