import { downloadFile } from '@tw/utils/module/gcs';
import { cliConfig } from '../../config';
import { runProcess } from '../../utils/runProcess';
import { cliError } from '../../utils/logs';
import { exit } from 'process';
import { cliExit } from '../../utils/exit';

export async function connectToClickhouse(argv) {
  const { cluster_name = 'sonic-cluster', replica } = argv;

  const data = await downloadFile(
    `devops-${cliConfig.projectId}`,
    `hosted-service/clickhouse/${cluster_name}.json`,
    { forceCloud: true }
  );

  let domain = data.clickhouseTcpDomain;
  if (replica !== undefined) {
    domain = data.replicas.find((r: any) => r.name === `instance-0-${replica}`)?.domain;
  }
  const username = data.username;
  const password = data.password;
  if (!domain) {
    cliExit("Didn't find domain");
  }
  await runProcess({
    command: 'clickhouse',
    commandArgs: ['client', `--user`, username, `--password`, password, `--host`, domain],
    additionalArgs: {
      stdio: ['inherit', 'inherit'],
    },
  });
}
