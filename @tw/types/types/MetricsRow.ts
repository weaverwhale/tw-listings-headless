import { RawMetrics } from './Metrics';

type RowValue = {
  value: string;
  labels: any[];
  timestamp: string;
};

export type BigTableRow = {
  key: string;
  value: Record<string, RowValue[]>;
};

export type RowsWithLastData = {
  key: string;
  value: Record<string, RawMetrics>;
};

export type SingleParsedRow = {
  date: string;
  metrics: RawMetrics;
}[];
