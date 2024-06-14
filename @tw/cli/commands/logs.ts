import { spawn } from 'node:child_process';
import copy from 'copy-paste';
import { cliConfig } from '../config';

export function openLogs(argv) {
  const trace = copy.paste();
  let project = 'shofifi';
  if (argv.project || argv.prod || argv.stg) {
    project = cliConfig.projectId;
  }
  spawn('open', [
    `https://console.cloud.google.com/logs/query;query=trace%3D%22projects%2F${project}%2Ftraces%2F${trace}%22;duration=P1D?project=${project}`,
  ]);

  spawn('open', [
    `https://us5.datadoghq.com/apm/traces?query=${`env:${project} operation_name:express.request @tw.traceId:${trace}&cols=core_service,core_resource_name,log_duration,log_http.method,log_http.status_code&graphType=flamegraph&historicalData=false&messageDisplay=inline&query_translation_version=v0&shouldShowLegend=true&sort=time&spanType=all&spanViewType=metadata&tq_query_translation_version=v0&traceQuery=&view=spans`}`,
  ]);
}
