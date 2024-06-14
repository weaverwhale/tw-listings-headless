import { Timestamp } from "@firebase/firestore-types";

export enum NlqTypes {
  QUERY = "QUERY",
  RESULT = "RESULT",
}

export type NlqQuestion = {
  shopId: string;
  userId: string;
  question: string;
  type: NlqTypes;
  createdAt: Date | Timestamp;
  resutleReference?: string;
};

export type NlqResult = {
  shopId: string;
  userId: string;
  question: string;
  query: string;
  data?: {
    [key: string]: any;
  };
  insights: string;
  type: NlqTypes;
  createdAt: Date | Timestamp;
  queryReference?: string;
  data_types?: { x: any[]; y: any[] } | any;
};
