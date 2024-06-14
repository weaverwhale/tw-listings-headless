import { Worker } from 'worker_threads';

export function runInWorkerThread(func, ...args) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `
      const { parentPort } = require('worker_threads');
      parentPort.once('message', args => {
        try {
          const result = (${func})(...args);
          parentPort.postMessage({ result });
        } catch (error) {
          parentPort.postMessage({ error: error.message });
        }
      });
    `,
      { eval: true }
    );

    worker.on('message', ({ result, error }) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    worker.postMessage(args);
  });
}
