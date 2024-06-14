import { IntegrationFetchChunkData } from './integrationFetchChunkData';

export type IntegrationStartJobResponse = {
  data: IntegrationFetchChunkData;
  queueName?: string;
  endpoint?: string;
};
