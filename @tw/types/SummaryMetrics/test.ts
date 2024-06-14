import { SummaryMetrics } from './SummaryMetrics';
import { ElementTypes } from '../willyTypes';

import * as fs from 'fs';

interface ExpressionElement {
  value: string;
  type: string; // Assuming this matches the structure within willyConfig.expression
}

interface WillyConfigWithColumnId {
  isCustomMetric: false;
  columnId: string;
}

interface WillyConfigWithExpression {
  isCustomMetric: true;
  expression: ExpressionElement[];
}

function isWillyConfigWithColumnId(willyConfig: any): willyConfig is WillyConfigWithColumnId {
  return willyConfig !== undefined && willyConfig.isCustomMetric === false;
}

function isWillyConfigWithExpression(willyConfig: any): willyConfig is WillyConfigWithExpression {
  return willyConfig !== undefined && willyConfig.isCustomMetric === true;
}

const metricsWithoutWillyConfig = Object.entries(SummaryMetrics)
  .filter(([key, metric]) => !metric.willyConfig)
  .map(([key]) => key);

const columnIdsFromBasicMetrics = Object.values(SummaryMetrics).flatMap((metric) =>
  isWillyConfigWithColumnId(metric.willyConfig) ? [metric.willyConfig.columnId] : []
);

const expressionsFromBasicMetricIdsAllExistInIds = Object.values(SummaryMetrics).flatMap((metric) =>
  isWillyConfigWithExpression(metric.willyConfig)
    ? metric.willyConfig.expression
        .filter((exp) => exp.type === ElementTypes.METRIC) // Use ElementTypes enum for comparison
        .map((exp) => exp.value)
    : []
);

const idsAllExistIn = Object.values(SummaryMetrics)
  .filter((metric) => isWillyConfigWithColumnId(metric.willyConfig))
  .map((metric) => metric.willyConfig.id);

const result = {
  metricsWithoutWillyConfig,
  columnIdsFromBasicMetrics,
  expressionsFromBasicMetricIdsAllExistInIds,
  idsAllExistIn,
};

fs.writeFile('test.json', JSON.stringify(result, null, 2), (error) => {
  if (error) {
    console.error('Error writing to file:', error);
    // Handle the error appropriately
  } else {
    console.log('Successfully wrote data to test.json');
  }
});

// npx ts-node test.ts
