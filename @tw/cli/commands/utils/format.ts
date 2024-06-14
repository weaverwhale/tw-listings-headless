import * as os from 'os';
import fs from 'fs';
import { runProcess } from '../../utils/runProcess';

export const globalPrettier = `${os.homedir()}/.prettierrc`;

const prettierConfig = {
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
};

export async function runFormat(argv: any) {
  const path = argv._[1] || '.';
  fs.writeFileSync(globalPrettier, JSON.stringify(prettierConfig, null, 2));
  await runProcess({
    command: 'npx',
    commandArgs: [
      'prettier',
      '--write',
      '--config',
      globalPrettier,
      '!**/{node_modules,build,module,tw-config.json}/**',
      path,
    ],
    log: true,
  });
}
