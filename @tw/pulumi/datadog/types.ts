import * as pulumi from '@pulumi/pulumi';

interface Contact {
  name: string;
  type: 'email' | 'slack';
  contact: string;
}

interface Repos {
  name: string;
  provider: string;
  url: pulumi.Input<string>;
}

interface Doc {
  name: string;
  provider: string;
  url: string;
}

interface Link {
  name: string;
  type: 'dashboard';
  url: pulumi.Output<string>;
}

interface Integrations {
  pagerduty: string;
}

export interface DatadogService {
  'schema-version': string;
  'dd-service': string;
  team?: string;
  contacts?: Contact[];
  repos?: Repos[];
  docs?: Doc[];
  links?: Link[];
  tags?: string[];
  integrations?: Integrations;
}

export type DatadogResources =
  | 'apmHttp'
  | 'pubsub'
  | 'pubsubPull'
  | 'pubsubPush'
  | 'saber'
  | 'bigtable'
  | 'redis'
  | 'k8s'
  | 'sql'
  | 'cloudTasks'
  | 'storage'
  | 'mongo'
  | 'cloudRun'
  | 'temporal'
  | 'temporalDetailed'
  | 'temporalServer'
  | 'chronos'
  | 'logging';
