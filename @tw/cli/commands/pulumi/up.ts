import * as path from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import { execSync } from 'node:child_process';
import { getApplicableStacks, triggerCloudBuilds } from '../../utils/cloudBuild';
import { cliError } from '../../utils/logs';
import { getCurrentBranch } from '../../utils/git';
import { loadPulumiProject } from '../../utils/pulumi';
import { getGitRepoName, getGithubOrg } from '@tw/devops';
import { spawn } from 'child_process';
import { runIDirectory } from './../i';
import { getPulumiPaths } from './getPaths';
import { cliExit } from '../../utils/exit';
const { Select } = require('enquirer');

export async function runPulumiUp(argv, justTrigger = false) {
  delete process.env.IS_LOCAL;

  const { gitRoot, dirsAbsolute } = await getPulumiPaths(argv);
  const applicableStacks = await getApplicableStacks(argv, dirsAbsolute);
  for (const dirAbsolute of dirsAbsolute) {
    const pathFromGitRoot = path.relative(gitRoot, dirAbsolute);

    if (!fs.existsSync(path.join(dirAbsolute, 'Pulumi.yaml'))) {
      cliExit('Provided path is not a pulumi project');
    }

    const pulumiProject = (await loadPulumiProject(dirAbsolute)).name;
    const repo = await getGitRepoName();
    const branch = await getCurrentBranch();
    const substitutions = {
      _SERVICE_ID: pulumiProject,
      _PULUMI_PROJECT: pulumiProject,
      _PATH: pathFromGitRoot,
      _BRANCH_NAME: branch,
      _REPO: repo,
      _GITHUB_ORG: await getGithubOrg(),
    };
    if (justTrigger) {
      substitutions['_JUST_TRIGGER'] = true;
    }

    let runPreviews = !argv.noPreview;

    for (let stack of applicableStacks) {
      let continueValue = 'yes';
      if (runPreviews) {
        let command = 'pulumi';
        let cmdArgs = [
          'preview',
          '--color=always',
          `--stack=${stack.startsWith('triplewhale/') ? stack : `triplewhale/${stack}`}`,
        ];
        if (dirAbsolute !== '.') {
          cmdArgs.push(`--cwd=${dirAbsolute}`);
        }
        let cmd = `${command} ${cmdArgs.join(' ')}`;
        const diffProc = spawn(command, cmdArgs.concat(['--diff']));
        let diffErr: string = '';
        diffProc.on('error', (err) => {
          diffErr = err.message;
        });
        const diffStream = new stream.PassThrough();
        diffProc.stdout.pipe(diffStream);
        await runIDirectory(dirAbsolute);
        execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
        continueValue = await continuePrompt(stack);
        if (continueValue === 'diff') {
          if (diffErr) {
            cliExit(`Error running diff: ${diffErr}`);
          }
          process.stdout.write(Buffer.from(diffStream.read()));
          continueValue = await continuePrompt(stack, true);
        }
      }
      if (continueValue === 'yes') {
        await triggerCloudBuilds({
          argv,
          buildNames: ['pulumi-up'],
          substitutions,
          dirs: [dirAbsolute],
          applicableStacks: [stack],
        });
      } else {
        continue;
      }
    }
  }
}

async function continuePrompt(stack: string, noDiff?: boolean) {
  const prompt = new Select({
    message: `Do you want to apply these changes to stack ${stack}?`,
    choices: [
      { message: 'Yes', name: 'yes' },
      { message: 'No', name: 'no' },
      !noDiff && { message: 'View Diff', name: 'diff' },
    ].filter(Boolean),
  });
  return await prompt.run();
}
