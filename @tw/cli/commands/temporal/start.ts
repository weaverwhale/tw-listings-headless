import { getTemporalClient, createTemporalWorker } from '@tw/temporal';

export async function startActivity(argv: any) {
  createTemporalWorker({
    taskQueue: 'cli-workflow',
    workflowsPath: require.resolve('./workflow'),
    namespace: 'default',
  });

  const client = await getTemporalClient();

  const handle = await client.workflow.start('run', {
    workflowId: 'test-' + Math.random(),
    taskQueue: 'cli-workflow',
    args: [argv.q, argv.t, JSON.parse(argv.p)],
  });
  await handle.result();
}

export async function startWorkflow(argv: any) {
  const client = await getTemporalClient();

  const handle = await client.workflow.start(argv.t, {
    workflowId: 'test-' + Math.random(),
    taskQueue: argv.q,
    args: [JSON.parse(argv.p)],
  });
  await handle.result();
}
