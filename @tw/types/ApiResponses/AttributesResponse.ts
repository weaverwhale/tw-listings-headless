import { AnalyticsAttributes } from '../types';
import { BaseApiResponse } from './BaseApiResponse';

export class ApiAttributesResponse extends BaseApiResponse<AnalyticsAttributes[]> {
  data: AnalyticsAttributes[];
}
