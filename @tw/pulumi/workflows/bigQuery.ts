import { getConfigs } from '../utils';
import { Step } from './schema/workflows';

// the resulting rows are returned in a variable with the name specified
// in the resultsVariable argument,
// which are a series of JSON f,v objects for indicating fields and values
export function bigQueryQuery(args: { name: string; query: string; resultsKey: string }): {
  [k: string]: Step;
} {
  const { name, query, resultsKey } = args;
  const { projectId } = getConfigs();

  const insertResultKey = `${name}InsertResult`;
  const pageResultKey = `${name}PageResult`;
  return {
    [name]: {
      steps: [
        {
          [`${name}-init`]: {
            assign: [
              {
                pageToken: null,
              },
              {
                [resultsKey]: [],
              },
            ],
          },
        },
        {
          [`${name}-submitQuery`]: {
            try: {
              call: 'googleapis.bigquery.v2.jobs.insert',
              args: {
                projectId,
                body: {
                  configuration: {
                    query: {
                      useLegacySql: false,
                      query,
                    },
                  },
                },
              },
              result: insertResultKey,
            },
            retry: {
              predicate: '${http.default_retry_predicate}',
            },
          },
        },
        {
          [`${name}-getPage`]: {
            try: {
              call: 'googleapis.bigquery.v2.jobs.getQueryResults',
              args: {
                projectId,
                jobId: `\${${insertResultKey}.jobReference.jobId}`,
                pageToken: '${pageToken}',
              },
              result: pageResultKey,
            },
            retry: {
              predicate: '${http.default_retry_predicate}',
            },
          },
        },
        {
          [`${name}-processPage`]: {
            for: {
              value: 'row',
              in: `\${${pageResultKey}.rows}`,
              steps: [
                {
                  processRow: {
                    assign: [
                      {
                        [resultsKey]: `\${list.concat(${resultsKey},row)}`,
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
    },
  };
}
