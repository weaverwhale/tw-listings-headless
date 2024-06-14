export enum FileContentFieldNames {
  none,
  data,
  fileData,
}

export type FileContentFieldName = keyof typeof FileContentFieldNames;

export interface EndpointParams {
  isPubsub?: boolean;
  fileContentFieldName?: FileContentFieldName;
}
