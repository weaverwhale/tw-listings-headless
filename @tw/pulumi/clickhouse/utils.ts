import { types } from '@tw/pulumi-clickhouse';
import { ClickhouseColumn } from '@tw/types';

export const clickhouseSystemDatabase = 'sonic_system';
export const clickhousePublicDatabase = 'public';
export const sonicUpdatedAtColumn = 'sonic_updated_at';

export function useCluster(engine: string) {
  return engine.includes('Replicated') ? 'main' : undefined;
}

export function getPartitionBies(args: {
  metadata: any;
  columns: ClickhouseColumn[];
  allowTwoPartitionBies?: boolean;
}) {
  const { metadata, columns, allowTwoPartitionBies = false } = args;
  const partitionBies: types.input.TablePartitionBy[] = [];

  if (metadata?.dateField) {
    const dateField = columns.find((column) => column.name === metadata.dateField);
    const partitionBy = ['DateTime', 'DateTime64'].includes(dateField?.type)
      ? {
          by: metadata.dateField,
          partitionFunction: 'toYYYYMMDD',
        }
      : {
          by: metadata.dateField,
        };

    partitionBies.push(partitionBy);
  }

  if (metadata?.providerAccountField && (allowTwoPartitionBies || !metadata?.dateField)) {
    partitionBies.push({
      by: metadata.providerAccountField,
      partitionFunction: 'sipHash64',
      mod: '1000',
    });
  }

  return partitionBies;
}
