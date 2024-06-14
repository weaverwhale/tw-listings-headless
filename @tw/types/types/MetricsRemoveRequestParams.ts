import { DataTypesIds, ServicesIds } from '../services/general';

export declare type MetricsRemoveRequestParams = {
  account_ids: string[];
  service_id: ServicesIds;
  dataType?: DataTypesIds;
  start?: string;
  end?: string;
  day?: string;
  timezone?: string;
  transactionId?: string;
};
