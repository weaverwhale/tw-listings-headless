import * as pulumi from '@pulumi/pulumi';
import * as kubernetes from '@pulumi/kubernetes';
import { k8sUniqueName } from '../k8s/utils';
import { K8sProvider } from '../k8s';
import { enumerateNumber } from '../utils';

export function createBackupJob(args: {
  name: string;
  k8sServiceAccount: kubernetes.core.v1.ServiceAccount;
  passwordBackup: pulumi.Output<string>;
  shardsCount: number;
  replicasCount: number;
  provider: K8sProvider;
}) {
  const { name, k8sServiceAccount, passwordBackup, shardsCount, replicasCount, provider } = args;
  new kubernetes.batch.v1.CronJob(
    k8sUniqueName(name, provider),
    {
      apiVersion: 'batch/v1',
      metadata: {
        name: 'clickhouse-backup-cron',
      },
      spec: {
        schedule: '0 0 * * *',
        concurrencyPolicy: 'Forbid',
        jobTemplate: {
          spec: {
            backoffLimit: 1,
            completions: 1,
            parallelism: 1,
            template: {
              metadata: {
                labels: {
                  app: 'clickhouse-backup-cron',
                },
              },
              spec: {
                restartPolicy: 'Never',
                serviceAccountName: k8sServiceAccount.metadata.name,
                containers: [
                  {
                    name: 'run-backup-cron',
                    image: 'clickhouse/clickhouse-client:latest',
                    imagePullPolicy: 'IfNotPresent',
                    env: [
                      {
                        name: 'CLICKHOUSE_SERVICES',
                        value: enumerateNumber(shardsCount)
                          .map((shard) =>
                            enumerateNumber(replicasCount)
                              .map((replica) => `chi-${name}-main-${shard}-${replica}`)
                              .join(',')
                          )
                          .join(','),
                      },
                      {
                        name: 'CLICKHOUSE_PORT',
                        value: '9000',
                      },
                      {
                        name: 'BACKUP_USER',
                        value: 'backup',
                      },
                      {
                        name: 'BACKUP_PASSWORD',
                        value: passwordBackup,
                      },
                      {
                        name: 'MAKE_INCREMENT_BACKUP',
                        value: '1',
                      },
                      {
                        name: 'FULL_BACKUP_WEEKDAY',
                        value: '1',
                      },
                    ],
                    command: [
                      'bash',
                      '-ec',
                      `CLICKHOUSE_SERVICES=$(echo $CLICKHOUSE_SERVICES | tr "," " ");
                      BACKUP_DATE=$(date +%Y-%m-%d-%H-%M-%S);
                      declare -A BACKUP_NAMES;
                      declare -A DIFF_FROM;
                      if [[ "" != "$BACKUP_PASSWORD" ]]; then
                        BACKUP_PASSWORD="--password=$BACKUP_PASSWORD";
                      fi;
                      for SERVER in $CLICKHOUSE_SERVICES; do
                        if [[ "1" == "$MAKE_INCREMENT_BACKUP" ]]; then
                          LAST_FULL_BACKUP=$(clickhouse-client -q "SELECT name FROM system.backup_list WHERE location='remote' AND name LIKE '%\${SERVER}%' AND name LIKE '%full%' AND desc NOT LIKE 'broken%' ORDER BY created DESC LIMIT 1 FORMAT TabSeparatedRaw" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD);
                          TODAY_FULL_BACKUP=$(clickhouse-client -q "SELECT name FROM system.backup_list WHERE location='remote' AND name LIKE '%\${SERVER}%' AND name LIKE '%full%' AND desc NOT LIKE 'broken%' AND toDate(created) = today() ORDER BY created DESC LIMIT 1 FORMAT TabSeparatedRaw" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD)
                          PREV_BACKUP_NAME=$(clickhouse-client -q "SELECT name FROM system.backup_list WHERE location='remote' AND desc NOT LIKE 'broken%' ORDER BY created DESC LIMIT 1 FORMAT TabSeparatedRaw" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD);
                          DIFF_FROM[$SERVER]="";
                          if [[ ("$FULL_BACKUP_WEEKDAY" == "$(date +%u)" && "" == "$TODAY_FULL_BACKUP") || "" == "$PREV_BACKUP_NAME" || "" == "$LAST_FULL_BACKUP" ]]; then
                            BACKUP_NAMES[$SERVER]="full-$BACKUP_DATE";
                          else
                            BACKUP_NAMES[$SERVER]="increment-$BACKUP_DATE";
                            DIFF_FROM[$SERVER]="--diff-from-remote=$PREV_BACKUP_NAME";
                          fi
                        else
                          BACKUP_NAMES[$SERVER]="full-$BACKUP_DATE";
                        fi;
                        echo "set backup name on $SERVER = \${BACKUP_NAMES[$SERVER]}";
                      done;
                      for SERVER in $CLICKHOUSE_SERVICES; do
                        echo "create \${BACKUP_NAMES[$SERVER]} on $SERVER";
                        clickhouse-client --echo -mn -q "INSERT INTO system.backup_actions(command) VALUES('create \${SERVER}-\${BACKUP_NAMES[$SERVER]}')" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD;
                      done;
                      for SERVER in $CLICKHOUSE_SERVICES; do
                        while [[ "in progress" == $(clickhouse-client -mn -q "SELECT status FROM system.backup_actions WHERE command='create \${SERVER}-\${BACKUP_NAMES[$SERVER]}' FORMAT TabSeparatedRaw" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD) ]]; do
                          echo "still in progress \${BACKUP_NAMES[$SERVER]} on $SERVER";
                          sleep 1;
                        done;
                        if [[ "success" != $(clickhouse-client -mn -q "SELECT status FROM system.backup_actions WHERE command='create \${SERVER}-\${BACKUP_NAMES[$SERVER]}' FORMAT TabSeparatedRaw" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD) ]]; then
                          echo "error create \${BACKUP_NAMES[$SERVER]} on $SERVER";
                          clickhouse-client -mn --echo -q "SELECT status,error FROM system.backup_actions WHERE command='create \${SERVER}-\${BACKUP_NAMES[$SERVER]}'" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD;
                          exit 1;
                        fi;
                      done;
                      for SERVER in $CLICKHOUSE_SERVICES; do
                        echo "upload \${DIFF_FROM[$SERVER]} \${BACKUP_NAMES[$SERVER]} on $SERVER";
                        clickhouse-client --echo -mn -q "INSERT INTO system.backup_actions(command) VALUES('upload \${DIFF_FROM[$SERVER]} \${SERVER}-\${BACKUP_NAMES[$SERVER]}')" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD;
                      done;
                      for SERVER in $CLICKHOUSE_SERVICES; do
                        while [[ "in progress" == $(clickhouse-client -mn -q "SELECT status FROM system.backup_actions WHERE command='upload \${DIFF_FROM[$SERVER]} \${SERVER}-\${BACKUP_NAMES[$SERVER]}'" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD) ]]; do
                          echo "upload still in progress \${BACKUP_NAMES[$SERVER]} on $SERVER";
                          sleep 5;
                        done;
                        if [[ "success" != $(clickhouse-client -mn -q "SELECT status FROM system.backup_actions WHERE command='upload \${DIFF_FROM[$SERVER]} \${SERVER}-\${BACKUP_NAMES[$SERVER]}'" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD) ]]; then
                          echo "error \${BACKUP_NAMES[$SERVER]} on $SERVER";
                          clickhouse-client -mn --echo -q "SELECT status,error FROM system.backup_actions WHERE command='upload \${DIFF_FROM[$SERVER]} \${SERVER}-\${BACKUP_NAMES[$SERVER]}'" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD;
                          exit 1;
                        fi;
                        clickhouse-client --echo -mn -q "INSERT INTO system.backup_actions(command) VALUES('delete local \${SERVER}-\${BACKUP_NAMES[$SERVER]}')" --host="$SERVER" --port="$CLICKHOUSE_PORT" --user="$BACKUP_USER" $BACKUP_PASSWORD;
                      done;
                      echo "BACKUP CREATED"`,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    { provider }
  );
}

// {
//   image: 'altinity/clickhouse-backup:2.5.0',
//   name: 'clickhouse-backup',
//   command: ['bash', '-xc', '/bin/clickhouse-backup server'],
//   env: [
//     // https://github.com/Altinity/clickhouse-backup?tab=readme-ov-file#default-config
//     {
//       name: 'UPLOAD_CONCURRENCY',
//       value: '100',
//     },
//     {
//       name: 'DOWNLOAD_CONCURRENCY',
//       value: '100',
//     },
//     {
//       name: 'GCS_CLIENT_POOL_SIZE',
//       value: '500',
//     },
//     {
//       name: 'GCS_CHUNK_SIZE',
//       value: String(100 * 1024 * 1024),
//     },
//     {
//       name: 'LOG_LEVEL',
//       value: 'debug',
//     },
//     {
//       name: 'ALLOW_EMPTY_BACKUPS',
//       value: 'true',
//     },
//     {
//       name: 'API_LISTEN',
//       value: '0.0.0.0:7171',
//     },
//     {
//       name: 'API_CREATE_INTEGRATION_TABLES',
//       value: 'true',
//     },
//     {
//       name: 'BACKUPS_TO_KEEP_REMOTE',
//       value: '3',
//     },
//     {
//       name: 'REMOTE_STORAGE',
//       value: 'gcs',
//     },
//     {
//       name: 'GCS_BUCKET',
//       value: backupBucket.name,
//     },
//     {
//       name: 'GCS_PATH',
//       value: 'backup/shard-{shard}',
//     },
//     {
//       name: 'GCS_DEBUG',
//       value: 'true',
//     },
//   ],
//   ports: [
//     {
//       containerPort: 7171,
//       name: 'api',
//     },
//   ],
// },
