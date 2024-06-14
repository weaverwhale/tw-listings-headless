import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TWRepo } from './types';
import { logger } from './log';

export function makeTWConfig(info: TWRepo) {
  logger.info('Making tw-config.json...');
  const config = {
    env: {
      PORT: 8080,
      DEBUG_PORT: 9229 + info.computerName.length,
      SERVICE_ID: info.computerName,
    },
    color: info.color,
    dependencies: info.dockerDeps,
    tags: info.tags,
    maintainers: info.maintainers,
    runtime: {
      ts: 'node',
      python: 'python',
    }[info.language],
  };
  fs.writeFileSync(path.join(info.path, 'tw-config.json'), JSON.stringify(config, null, 2));
}
