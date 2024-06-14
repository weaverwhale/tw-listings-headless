import { runProcess } from '../../utils/runProcess';
import fs from 'fs';

export async function modifyPulumiStack(argv) {
  const { stdout } = await runProcess({
    command: 'pulumi',
    commandArgs: ['stack', 'export'],
  });
  // get stack name
  let { stdout: stackName } = await runProcess({
    command: 'pulumi',
    commandArgs: ['stack', '--show-name'],
  });
  stackName = stackName.trim();
  const state = JSON.parse(stdout.toString());
  fs.writeFileSync(`${stackName}-bac.json`, JSON.stringify(state));
  if (argv['provider']) {
    const resources: any[] = [];
    const changedResources = [];
    const { stdout } = await runProcess({
      command: 'pulumi',
      commandArgs: ['preview', '--json'],
    });
    const diff = JSON.parse(stdout.toString());
    fs.writeFileSync(`${stackName}-diff.json`, JSON.stringify(diff));
    const providerReplaces: { urn: string; newProvider: string }[] = [];
    for (const step of diff.steps) {
      if (step.op === 'replace' && step.replaceReasons?.includes('provider')) {
        providerReplaces.push({ urn: step.urn, newProvider: step.newState.provider });
      }
    }
    for (const resource of state.deployment.resources) {
      const replacement = providerReplaces.find((r) => r.urn === resource.urn);
      if (replacement) {
        resource.provider = replacement.newProvider;
        changedResources.push(resource);
      } else {
        resources.push(resource);
      }
    }
    if (changedResources.length) {
      // insert the resource one after its provider
      for (const resource of changedResources) {
        const providerUrn = resource.provider.split('::').slice(0, 4).join('::');
        const providerId = resource.provider.split('::').pop();
        const providerIndex = resources.findIndex((r) => {
          return r.urn === providerUrn && r.id === providerId;
        });
        resources.splice(providerIndex + 1, 0, resource);
      }
    }
    state.deployment.resources = resources;
  } else {
    const resources: any[] = [];
    for (const resource of state.deployment.resources) {
      if (resource.pendingReplacement) {
        resource.pendingReplacement = false;
      }
      resources.push(resource);
    }
    state.deployment.resources = resources;
  }
  fs.writeFileSync(`${stackName}-new.json`, JSON.stringify(state));
  console.log(JSON.stringify(state));
}

export async function getPulumiStackExport(args: { cwd: string; stack: string }): Promise<{}> {
  const { cwd, stack } = args;
  const { stdout } = await runProcess({
    command: 'pulumi',
    commandArgs: ['stack', 'export', '--cwd', cwd, '--stack', `triplewhale/${stack}`],
  });
  return JSON.parse(stdout);
}

export async function getPulumiOutputs(args: { cwd: string; stack: string }) {
  const { cwd, stack } = args;
  const { stdout } = await runProcess({
    command: 'pulumi',
    commandArgs: ['stack', 'output', '--json', '--cwd', cwd, '--stack', stack],
  });

  return JSON.parse(stdout);
}
