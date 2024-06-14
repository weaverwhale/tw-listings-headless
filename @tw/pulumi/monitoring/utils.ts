export function getTileForMetric(args: {
  serviceId?: string;
  resourceType: string | undefined;
  metricType: string;
  title: string;
  pos: { xPos: number; yPos: number };
  step: number;
  columns: number;
  filter?: string;
  aggregation?: any;
}) {
  const { serviceId, resourceType, metricType, title, pos, step, columns, filter, aggregation } =
    args;
  let metricFilter = `metric.type="${metricType}"`;
  if (resourceType) {
    metricFilter += ` resource.type="${resourceType}"`;
  }
  if (serviceId) {
    metricFilter += ` metadata.user_labels."service-id"="${serviceId}"`;
  }
  if (filter) {
    metricFilter += ` ${filter}`;
  }
  const result = {
    height: step,
    widget: {
      title,
      xyChart: {
        chartOptions: {
          mode: 'COLOR',
        },
        dataSets: [
          {
            minAlignmentPeriod: '60s',
            plotType: 'LINE',
            targetAxis: 'Y1',
            timeSeriesQuery: {
              timeSeriesFilter: {
                aggregation: aggregation
                  ? aggregation
                  : {
                      alignmentPeriod: '60s',
                      perSeriesAligner: 'ALIGN_MEAN',
                    },
                filter: metricFilter,
              },
            },
          },
        ],
        timeshiftDuration: '0s',
        yAxis: {
          label: 'y1Axis',
          scale: 'LINEAR',
        },
      },
    },
    width: step,
    xPos: pos.xPos,
    yPos: pos.yPos,
  };
  if (pos.xPos < columns - step) pos.xPos += step;
  else {
    pos.xPos = 0;
    pos.yPos += step;
  }
  if (result.xPos === 0) {
    delete result.xPos;
  }
  if (result.yPos === 0) {
    delete result.yPos;
  }
  return result;
}

export function cloudRunFilter(serviceId) {
  return `resource.label."service_name"="${serviceId}"`;
}

export function labelFilter(serviceId) {
  return `metadata.user_labels."service-id"="${serviceId}"`;
}

export function cloudRunAggregation() {
  return {
    alignmentPeriod: '60s',
    crossSeriesReducer: 'REDUCE_MEAN',
    perSeriesAligner: 'ALIGN_DELTA',
  };
}

export function createDataSet(args: {}) {}
