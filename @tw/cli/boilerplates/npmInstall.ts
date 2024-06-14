import { execSync } from 'node:child_process';

export function npmInstall(path: string, dependencies: string[], devDependencies?: string[]) {
  execSync('tw auth');
  const command = ['npm', 'install', '--save', '--progress=false', ...dependencies];
  if (devDependencies?.length) {
    command.push('&&', 'npm', 'install', '--save-dev', ...devDependencies);
  }
  execSync(command.join(' '), { cwd: path, stdio: 'pipe' });
}
