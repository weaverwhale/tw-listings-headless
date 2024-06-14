import { Model } from 'mongoose';
import { logger } from '../logger';
import { ActivitySettings } from './types';

export const getObjectHistory = async <T extends ActivitySettings>(
  id: string,
  level: string,
  model: Model<T>
) => {
  try {
    const old: any = await model
      .findOne({ id, level }, { new: 1 }, { sort: { updatedAt: -1 } })
      .exec();
    return old ? old.new : null;
  } catch (e) {
    logger.error(`getObjectHistory failed, id: ${id} level: ${level} error: ${e}`);
  }
};
