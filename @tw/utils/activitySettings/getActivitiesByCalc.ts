import { Model } from 'mongoose';
import { logger } from '../logger';
import { getActivityDiffObject } from './getActivityDiffObject';
import { getObjectHistory } from './getObjectHistory';
import { ActivityDiff, ActivityMetaData, ActivitySettings, ActivityType } from './types';

export const getActivitiesByCalc = async <T extends ActivitySettings>(
  arr: any[],
  metaData: ActivityMetaData,
  model: Model<T>,
  isDeleted: (item: any) => boolean = null
): Promise<ActivitySettings[]> => {
  try {
    const promises = arr.map(async (o): Promise<ActivitySettings> => {
      let res: ActivitySettings = null;
      const old: any = await getObjectHistory(o.id, metaData.level, model);
      if (old) {
        const diffObject: ActivityDiff = getActivityDiffObject(old, o);
        res = diffObject ? { id: o.id, ...metaData, ...diffObject } : null;
      } else {
        res = {
          id: o.id,
          old: null,
          new: o,
          changes: null,
          activityType: ActivityType.CREATED,
          ...metaData,
        };
      }
      if (res && isDeleted && isDeleted(o)) {
        res = {
          ...res,
          activityType: ActivityType.DELETED,
        };
      }
      return res;
    });
    const activities: ActivitySettings[] = await Promise.all(promises);
    return activities.filter((o) => o);
  } catch (error) {
    logger.error('calcActivitiesChanges failed', { metaData, error });
  }
};
