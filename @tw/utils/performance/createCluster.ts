import { isLocal } from '@tw/constants';
import cluster from 'node:cluster';
import process from 'node:process';
import { logger } from '../logger';

export function createCluster(mainFunction, args?: { workers?: number }) {
  const { workers = 1 } = args || {};
  if (cluster.isPrimary && !isLocal) {
    logger.info(`Primary (pid:${process.pid}) started. Launching ${workers} workers.`);

    // Fork workers.
    for (let i = 0; i < workers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(
        `worker (pid:${worker.process.pid}) exited with code ${code} and signal ${signal}`
      );
      if (!Object.keys(cluster.workers).length) {
        logger.error('All workers exited, exiting...');
        process.exit(1);
      }
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, terminating workers...');
      for (const id in cluster.workers) {
        cluster.workers[id].kill('SIGTERM');
      }
    });
  } else {
    logger.info(`Worker (pid:${process.pid}) started`);
    mainFunction();
  }
}
