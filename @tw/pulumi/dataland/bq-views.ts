import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';

import { setDefaultLabelsForAllResources, asBqSchema } from './utils';
import { publicDatasetId } from './names';

interface buildViewArgs {
  pulumiResourceName?: string;
  viewName: string;
  viewDataset?: pulumi.Input<string>;
  viewQuery: ({ projectId, datasetId }: Record<string, string>) => string;
  viewQueryParamsObject: Record<string, pulumi.Output<string> | string>;
  viewDescription?: string;
  viewSchema?: Array<Object>;
  materializedView?:
    | undefined
    | {
        EnableRefresh: boolean;
        RefreshIntervalMs?: number /* in milliseconds, defaults to 30 minutes */;
      };
  viewLabels?: object;
  dependencies?: Array<pulumi.Resource>;
}

const buildViewDefaults: buildViewArgs = {
  viewName: '',
  pulumiResourceName: '',
  viewDataset: publicDatasetId,
  viewQuery: ({ projectId, datasetId }: Record<string, string>) => '',
  viewQueryParamsObject: {
    projectId: getConfigs().projectId,
    datasetId: publicDatasetId,
  },
  viewDescription: undefined,
  viewSchema: undefined,
  materializedView: undefined,
  viewLabels: {},
  dependencies: [],
};

export function buildView(buildViewArgs: buildViewArgs): gcp.bigquery.Table {
  setDefaultLabelsForAllResources();
  // Set defaults for nested object arguments
  buildViewArgs = { ...buildViewDefaults, ...buildViewArgs };

  // extracting keys and values from viewQueryParamsObject
  let ks = Object.keys(buildViewArgs.viewQueryParamsObject);
  let vs = pulumi.all(ks.map((k) => buildViewArgs.viewQueryParamsObject[k])).apply((v) => v);

  const query = vs.apply(
    (t: any) =>
      `${buildViewArgs.viewQuery(
        t.reduce(
          (
            obj: Record<string, pulumi.Output<string> | string>,
            value: pulumi.Output<string> | string,
            index: number
          ) => {
            obj[ks[index]] = value;
            return obj;
          },
          {} as Record<string, pulumi.Output<string> | string>
        )
      )}`
  );

  const pulumiResourceName = buildViewArgs.pulumiResourceName || buildViewArgs.viewName;
  const bqView = new gcp.bigquery.Table(
    pulumiResourceName,
    {
      datasetId: buildViewArgs.viewDataset,
      tableId: buildViewArgs.viewName,
      view: !buildViewArgs.materializedView
        ? {
            query: query,
            useLegacySql: false,
          }
        : undefined,
      materializedView: buildViewArgs.materializedView
        ? {
            query: query,
            enableRefresh: buildViewArgs.materializedView.EnableRefresh,
            refreshIntervalMs: buildViewArgs.materializedView.RefreshIntervalMs,
          }
        : undefined,
      schema: buildViewArgs.viewSchema
        ? JSON.stringify(asBqSchema(buildViewArgs.viewSchema, true))
        : undefined,
      description: buildViewArgs.viewDescription,
      labels: { ...buildViewArgs.viewLabels },
      deletionProtection: false,
    },
    {
      replaceOnChanges: ['schema'],
      deleteBeforeReplace: true,
      dependsOn: buildViewArgs.dependencies,
    }
  );
  return bqView;
}
