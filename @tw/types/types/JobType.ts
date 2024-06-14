export declare type JobType =
  | 'initial'
  | 'updateToday'
  | 'updateTodaySettings'
  | 'updateTodayLight'
  | 'updateWeek'
  | 'update'
  | 'create'
  | 'edited'
  | 'webhook';

export type AllJobTypes = {
  [type in JobType]: type;
};

export const JobTypes: AllJobTypes = {
  initial: 'initial',
  updateToday: 'updateToday',
  updateTodaySettings: 'updateTodaySettings',
  updateTodayLight: 'updateTodayLight',
  updateWeek: 'updateWeek',
  update: 'update',
  create: 'create',
  edited: 'edited',
  webhook: 'webhook',
};
