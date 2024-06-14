import * as k8s from '@kubernetes/client-node';
import * as uuid from 'uuid';
import { cliConfig } from '../../config';
import { downloadFile, getStorageClient } from '@tw/utils/module/gcs';
import { cliError, cliLog, cliSuccess } from '../../utils/logs';
import { getGcloudUserEmail, kubeAuth } from '@tw/devops';
import { confirm } from '../../enquirer/confirm';
import { deepMerge } from '@tw/helpers';
import { logsLinkFilter } from '@tw/utils/module/express';

export async function runK8sJob(argv) {
  const client = getStorageClient({ forceCloud: true });
  const jobs = (
    await client.bucket(`devops-${cliConfig.projectId}`).getFiles({
      prefix: `k8s-jobs/${argv.service}`,
    })
  )[0].map((file) => file.name.split('/').pop().split('.').shift());
  if (!jobs.includes(argv.name)) {
    cliError(`Job ${argv.name} not found.`);
    cliLog(`Available jobs: ${jobs.join(', ')}`);
    return;
  }
  const config = await downloadFile(
    `devops-${cliConfig.projectId}`,
    `k8s-jobs/${argv.service}/${argv.name}.json`,
    {
      forceCloud: true,
    }
  );

  const kc = new k8s.KubeConfig();
  kubeAuth(config.context);
  kc.loadFromDefault();
  kc.setCurrentContext(config.context);
  const [_1, _2, location, cluster] = kc.currentContext.split('_');
  const k8sApi = kc.makeApiClient(k8s.BatchV1Api);
  const jobName = `${config.job.metadata.name}-${uuid.v4()}`;
  const namespace = config.job.metadata.namespace;
  const extraArgs = argv._.slice(1);
  const container = config.job.spec.template.spec.containers[0];
  container['command'] = [...(container['command'] || []), ...extraArgs];
  function convertEnvs(envs) {
    return envs.map((env) => {
      const [name, value] = env.split('=');
      return { name, value };
    });
  }
  container['env'] = container['env'].concat(convertEnvs(argv.env || []));
  container['env'].push({ name: 'AUTHOR', value: getGcloudUserEmail() });
  const result = deepMerge(config, {
    job: {
      metadata: {
        name: jobName,
      },
    },
  });
  if (argv.trace) {
    container['env'].push({ name: 'LOG_LEVEL', value: 'trace' });
  }

  cliLog(`Job info:
  name: ${jobName}
  namespace: ${namespace}
  command: ${result['job']['spec']['template']['spec']['containers'][0]['command'].join(' ')}`);
  await confirm('OK to continue?');
  try {
    const res = await k8sApi.createNamespacedJob({
      namespace: result.job.metadata.namespace,
      body: result.job,
    });
    cliSuccess(`Job ${jobName} created.`);
    console.log();
    cliLog(
      `Logs: ${logsLinkFilter(
        {
          'labels.k8s-pod/batch_kubernetes_io/controller-uid': res.metadata.uid,
        },
        cliConfig.projectId
      )}`
    );
    console.log();
    cliLog(
      `K8s: https://console.cloud.google.com/kubernetes/job/${location}/${cluster}/${namespace}/${jobName}/details?project=${cliConfig.projectId}`
    );
  } catch (e) {
    cliError(e.body?.message || e.body || e);
  }
}
