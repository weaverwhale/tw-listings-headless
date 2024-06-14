import { FetchChunkData } from './fetchChunkData';

export type alternateEndpoint = {
  endpoint: string;
  conditionField: string;
  conditionString: string;
};

export type startJobOptions = {
  req: Request;
  defaultEndpoint?: string;
  queueName?: string;
  endpoints?: alternateEndpoint[];
};

export type startJobResponse = {
  data: FetchChunkData;
  queueName?: string;
  endpoint?: string;
};
