import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger } from './log';
import type { TWPythonRepo } from './types';

export function makePythonDefaults(info: TWPythonRepo) {
  logger.info('Making requirements.txt', '...');
  const requirementsTxt = (info.requirements || []).join('\n') + '\n';
  fs.writeFileSync(path.join(info.path, 'requirements.txt'), requirementsTxt);
}
