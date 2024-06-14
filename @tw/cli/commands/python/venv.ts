import fs from 'fs';
import { packageJson } from '../../constants';
import { cliLog, cliSuccess } from '../../utils/logs';
import { runProcess } from '../../utils/runProcess';
import { getPythonCommand } from '../../utils/python';

const indexUrl = 'https://pypi.org/simple/';

export async function initVenv() {
  const venvDir = `venv`;
  const venvEnv = {
    PATH: `${venvDir}/bin:${process.env.PATH}`,
    VIRTUAL_ENV: venvDir,
  };
  const pythonCommand = await getPythonCommand();

  const noVenv = !fs.existsSync(venvDir);
  let isIsOldVenv = false;
  if (!noVenv) {
    try {
      const venvVersion = fs.readFileSync(venvDir + '/.tw-version', 'utf-8');
      if (venvVersion !== packageJson.version) {
        cliLog(`Found venv from cli version: ${venvVersion}, updating...`);
        isIsOldVenv = true;
      } else {
        cliLog(`Found venv from cli version: ${venvVersion}`);
      }
    } catch (e) {
      isIsOldVenv = true;
    }
  }
  if (noVenv || isIsOldVenv) {
    await runProcess({
      command: pythonCommand,
      commandArgs: ['-m', 'venv', ...process.argv.slice(3), 'venv'],
      log: true,
    });
    fs.writeFileSync(venvDir + '/.tw-version', packageJson.version);
    await runProcess({
      command: process.env.SHELL || 'bash',
      commandArgs: [
        '-c',
        `pip install --index-url ${indexUrl} --upgrade pip && pip install --index-url ${indexUrl} keyring keyrings.google-artifactregistry-auth debugpy`,
      ],
      additionalArgs: {
        // @ts-ignore
        env: {
          ...venvEnv,
        },
      },
      log: true,
    });
  }

  if (process.env.TW_COMMAND === 'python:init-env') {
    cliSuccess('To enable the virtual environment run: source venv/bin/activate');
  }
}
