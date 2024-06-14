import * as pulumi from '@pulumi/pulumi';

type ComponentConfig = {
  enabled: boolean;
  resourceNames?: (string | pulumi.Input<string>)[];
};

export let monitoringState: {
  pubsub: ComponentConfig;
  pubsubPull: ComponentConfig;
  pubsubPush: ComponentConfig;
  sql: ComponentConfig;
  saber: ComponentConfig;
  redis: ComponentConfig;
  k8s: ComponentConfig;
  apmHttp: ComponentConfig;
  cloudRun: ComponentConfig;
  bigtable: ComponentConfig;
  cloudTasks: ComponentConfig;
  storage: ComponentConfig;
  mongo: ComponentConfig;
  temporal: ComponentConfig;
  workflows: ComponentConfig;
} = {
  pubsub: {
    enabled: false,
  },
  pubsubPull: {
    enabled: false,
  },
  pubsubPush: {
    enabled: false,
  },
  sql: {
    enabled: false,
  },
  saber: {
    enabled: false,
  },
  redis: {
    enabled: false,
    resourceNames: [],
  },
  apmHttp: {
    enabled: false,
  },
  k8s: {
    enabled: false,
  },
  cloudRun: {
    enabled: false,
  },
  bigtable: {
    enabled: false,
  },
  storage: {
    enabled: false,
  },
  cloudTasks: {
    enabled: false,
    resourceNames: [],
  },
  mongo: {
    enabled: false,
    resourceNames: [],
  },
  temporal: {
    enabled: false,
  },
  workflows: {
    enabled: false,
  },
};
