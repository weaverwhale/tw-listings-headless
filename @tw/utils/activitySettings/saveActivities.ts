import { serviceId } from '@tw/constants';
import { callPubSub } from '../callPubSub';
import { logger } from '../logger';

import { Model } from 'mongoose';
import { ActivitySettings } from './types';

export const saveActivities = async (
  activities: ActivitySettings[],
  shopDomain: string,
  model: Model<any>,
  extendFilterField: string[] = []
) => {
  try {
    const docsToUpsert = activities.map((doc) => {
      const extendFilter: { [key: string]: any } = {};
      extendFilterField.forEach((name) => {
        extendFilter[name] = doc[name];
      });
      const filter = { id: doc.id, level: doc.level, ...extendFilter };
      return {
        replaceOne: {
          filter: filter,
          replacement: doc,
          upsert: true,
        },
      };
    });

    logger.info(`saveActivities for shop: ${shopDomain} activities length: ${activities.length}`);

    if (activities.length > 0) {
      const res = await model.bulkWrite(docsToUpsert);

      await callPubSub('new_activities_created', {
        shopId: shopDomain,
        serviceId,
        activities: activities,
      });
    }
  } catch (e) {
    logger.error(`saveActivities failed,  shop_domain: ${shopDomain} error: ${e}`);
  }
};
