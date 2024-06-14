import * as pulumi from '@pulumi/pulumi';

export const projectId = new pulumi.Config('gcp').require('project');
export const stackName = pulumi.getStack();

export const isProduction = stackName === 'shofifi';
export const isStaging = projectId === 'triple-whale-staging';
export const isLocal = Boolean(process.env.IS_LOCAL);

export const defaultDomain = 'whale3.io';
