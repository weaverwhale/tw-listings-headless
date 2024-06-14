import temp from 'temp';
import { selectProjects } from '../../enquirer/selectProjects';
import { objectToEnv } from '../../utils';
import { getCurrentBranch } from '../../utils/git';
import { runProcess } from '../../utils/runProcess';
import * as path from 'path';
import * as fs from 'fs';
import { getGcloudUserEmail, getGitSha } from '@tw/devops';
import { cliLog } from '../../utils/logs';

function createConfigString(args: { tags: string[]; buildArgs: string[] }) {
  const { tags, buildArgs } = args;
  return `
steps:
  - name: 'gcr.io/cloud-builders/docker'
    env:
      - 'PROJECT_ID=$PROJECT_ID'
      - 'BRANCH_NAME=$_BRANCH_NAME'
      - 'IMAGE_NAME=$_IMAGE_NAME'
      - 'DOCKER_REPO=$_DOCKER_REPO'
      - 'GITHUB_SHA=$_GITHUB_SHA'
      - 'EXTRA_TAG=$_EXTRA_TAG'
      - 'ARGS=$_ARGS'
      - 'F=$_F'
    script: >
      docker build ${tags
        .map((t) => `-t us-central1-docker.pkg.dev/$PROJECT_ID/$DOCKER_REPO/$IMAGE_NAME:${t} `)
        .join('')} \
      ${buildArgs.map((b) => `--build-arg ${b}`).join(' ')} --network=cloudbuild -f $F . && \
      docker push --all-tags us-central1-docker.pkg.dev/$PROJECT_ID/$DOCKER_REPO/$IMAGE_NAME
substitutions:
  _IMAGE_NAME:
  _AUTHOR:
  _BRANCH_NAME:
  _EXTRA_TAG:
  _DOCKER_REPO:
  _GITHUB_SHA:
  _F:
options:
  substitution_option: 'ALLOW_LOOSE'
`;
}

type Revision = {
  buildArgs: string[];
  tags: string[];
  projectId: string;
};

export async function runBuildImage(argv) {
  const author = getGcloudUserEmail();
  let projects;
  const branch = await getCurrentBranch();
  if (branch === 'master') {
    projects = await selectProjects();
  } else {
    projects = ['triple-whale-staging'];
  }

  const dockerfile = argv.f || 'Dockerfile';
  const dockerRepo = argv.r || 'devops-docker';
  const extraTag = argv.t || '';
  const sha = await getGitSha();
  const baseTags = [extraTag || sha];
  const substitutions = {
    _AUTHOR: author,
    _BRANCH_NAME: branch,
    _F: dockerfile,
  };

  const builds: Revision[] = [];

  const dir = path.resolve(path.dirname(dockerfile));

  const buildArgs = ['PROJECT_ID=$PROJECT_ID'];

  let revisions: Revision[];
  if (fs.existsSync(path.join(dir, 'tw.json'))) {
    const twJson = JSON.parse(fs.readFileSync(path.join(dir, 'tw.json'), 'utf8'));
    revisions = twJson.revisions;
  }
  for (const project of projects) {
    if (revisions) {
      revisions.forEach((revision) => {
        builds.push({
          buildArgs: [...revision.buildArgs, ...buildArgs],
          projectId: project,
          tags: [...revision.tags],
        });
      });
    } else {
      builds.push({
        buildArgs,
        projectId: project,
        tags: ['latest', ...baseTags],
      });
    }
  }

  // set _IMAGE_NAME to the dir name of where the dockerfile is located
  const dockerfilePath = path.join(process.cwd(), dockerfile);
  const dirName = path.dirname(dockerfilePath);
  const imageName = path.basename(dirName);
  substitutions['_IMAGE_NAME'] = imageName;
  substitutions['_DOCKER_REPO'] = dockerRepo;
  builds.map(({ projectId, tags }) => {
    tags.map((tag) => {
      cliLog(
        `<${projectId}> us-central1-docker.pkg.dev/${projectId}/${dockerRepo}/${imageName}:${tag}`
      );
    });
  });

  await Promise.all(
    builds.map(({ buildArgs, tags, projectId }) => {
      const configFile = temp.path({ suffix: '.yaml' });
      cliLog(`File: ${configFile}`);
      fs.writeFileSync(configFile, createConfigString({ tags, buildArgs }));
      return runProcess({
        log: true,
        name: projectId,
        command: 'gcloud',
        commandArgs: [
          'builds',
          'submit',
          `--config=${configFile}`,
          `--substitutions=${objectToEnv(substitutions)}`,
          '.',
          `--project=${projectId}`,
        ],
      });
    })
  );
}
