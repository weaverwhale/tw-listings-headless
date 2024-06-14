import { runProcess } from './runProcess';
import { loadPackageJson } from '../utils';

export async function runAndBuildPackages(packages) {
  for (const pkg of packages) {
    const packageJson = await loadPackageJson({ packagePath: pkg });
    const name = packageJson.name + ' (package)';
    runProcess({
      name,
      command: 'tw',
      commandArgs: ['i', '--preserve'],
      color: packageJson.tw.color,
      log: true,
      additionalArgs: { cwd: pkg },
    }).then(() => {
      runProcess({
        name,
        command: 'npm',
        commandArgs: ['run', 'dev'],
        color: packageJson.tw.color,
        log: true,
        additionalArgs: { cwd: pkg },
      });
    });
  }
}
