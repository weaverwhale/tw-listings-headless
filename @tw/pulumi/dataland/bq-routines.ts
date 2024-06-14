import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import { getConfigs } from '../utils';
import { buildView } from './bq-views';
import { setDefaultLabelsForAllResources } from './utils';
import { functionsDatasetId, publicDatasetId } from './names';

interface buildRoutineArgs {
  routineName: string;
  routineDataset?: string;
  routineLanguage?: 'SQL' | 'JAVASCRIPT';
  routineType?: 'SCALAR_FUNCTION' | 'PROCEDURE' | 'TABLE_VALUED_FUNCTION';
  routineDefinitionBody: ({
    projectId,
    datasetId,
  }: Record<string, string | boolean | any[] | Function>) => string;
  routineDefinitionBodyParamsObject?: Record<
    string,
    pulumi.Output<string> | string | boolean | any[] | Function
  >;
  routineArguments?: { name: string; dataType: string }[];
  routineDescription?: string;
  routineReturnType?: string;
  dependencies?: Array<pulumi.Resource>;
  createViewForSchemaDefinition?: Boolean;
  renameViewName?: string;
  schema?: Array<any>;
  usingRoutineExample?: string;
}

const defaultRoutineDefinitionBodyParamsObject: Record<string, pulumi.Output<string> | string> = {
  projectId: getConfigs().projectId,
  datasetId: publicDatasetId,
};
const buildViewDefaults: buildRoutineArgs = {
  routineName: '',
  routineDataset: functionsDatasetId,
  routineLanguage: 'SQL',
  routineType: 'SCALAR_FUNCTION',
  routineDefinitionBody: ({ projectId, datasetId }: Record<string, string>) => '',
  routineDefinitionBodyParamsObject: defaultRoutineDefinitionBodyParamsObject,
  routineArguments: undefined,
  routineDescription: undefined,
  routineReturnType: undefined,
  dependencies: [],
  createViewForSchemaDefinition: false,
  usingRoutineExample: undefined,
};

function columnType(column) {
  if (column.mode == 'REPEATED') {
    return `ARRAY<${columnType({ type: column.type, fields: column.fields })}>`;
  } else if (column.type == 'RECORD') {
    return `STRUCT<${column.fields.map((c) => `${c.name} ${columnType(c)}`).join(', ')}>`;
  } else {
    return column.type;
  }
}

export function buildRoutine(buildRoutineArgs: buildRoutineArgs) {
  setDefaultLabelsForAllResources();

  // Set defaults for nested object arguments
  buildRoutineArgs = { ...buildViewDefaults, ...buildRoutineArgs };

  // extracting keys and values from viewQueryParamsObject
  const routineDefinitionBodyParamsObject =
    buildRoutineArgs.routineDefinitionBodyParamsObject || defaultRoutineDefinitionBodyParamsObject;
  let ks = Object.keys(routineDefinitionBodyParamsObject);
  let vs = pulumi.all(ks.map((k) => routineDefinitionBodyParamsObject[k])).apply((v) => v);

  const bqRoutine = new gcp.bigquery.Routine(
    buildRoutineArgs.routineName,
    {
      datasetId: pulumi.interpolate`${buildRoutineArgs.routineDataset}`,
      language: buildRoutineArgs.routineLanguage,
      routineType: buildRoutineArgs.routineType,
      routineId: buildRoutineArgs.routineName,
      definitionBody: vs.apply(
        (t: any) =>
          `${buildRoutineArgs.routineDefinitionBody(
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
      ),
      arguments: buildRoutineArgs.routineArguments,
      description: buildRoutineArgs.routineDescription,
      returnType: buildRoutineArgs.routineReturnType,
    },
    {
      dependsOn: buildRoutineArgs.dependencies,
    }
  );

  if (buildRoutineArgs.createViewForSchemaDefinition) {
    if (!buildRoutineArgs.schema)
      throw new Error('When creating a point the routine you must provide the schema');
    const viewName = buildRoutineArgs.renameViewName
      ? buildRoutineArgs.renameViewName
      : buildRoutineArgs.routineName;

    const routineExample = buildRoutineArgs.usingRoutineExample
      ? buildRoutineArgs.usingRoutineExample
      : buildRoutineArgs.routineArguments.map(
          ({ name, dataType }) => `${name}:${JSON.parse(dataType).typeKind}`
        );

    const colSelection = `select ${buildRoutineArgs.schema.map(
      (col) => `CAST(NULL AS ${columnType(col)}) AS ${col.name}`
    )}`;

    const viewQuery = `${colSelection}
      from (${colSelection})
      where ERROR("USE - SELECT * FROM \`${buildRoutineArgs.routineDataset}.${buildRoutineArgs.routineName}\`(${routineExample})")
      `;

    buildView({
      pulumiResourceName: `${viewName}-tvf-public-output`,
      viewName: viewName,
      viewDataset: publicDatasetId,
      viewQuery: ({}) => viewQuery,
      viewQueryParamsObject: {},
      viewSchema: buildRoutineArgs.schema,
      dependencies: [bqRoutine],
    });
  }

  return bqRoutine;
}
