import * as kubernetes from '@pulumi/kubernetes';
import * as gcp from '@pulumi/gcp';
import { TWDomain, createAuthProxyUrl, createTWDomain, getConfigs } from '../utils';
import { createK8sDeployment, CreateK8sDeploymentArgs } from './deployment';
import { createK8sNamespace } from './namespace';
import { getK8sProvider, K8sProvider } from './provider';
import { createK8sServiceAccount } from './sa';
import { createK8sSecret } from './secrets';
import { getKnativeProvider } from '../knative';
import { createKnativeDomainMapping } from '../knative/domain';
import { ServiceEntryDeployment } from '@tw/types';
import { addServiceEntryDeployment } from '../service/serviceEntry';
import { createKnativeServing, CreateKnativeServingArgs } from '../knative/serving';
import { defaultDomain, isProduction } from '../constants';
import { k8sDiscovery } from './discovery';
import { IngressMode, IngressesConfig } from './types';
import { dnsUrl } from '../cloudflare';
import { GCPServiceAccount } from '../iam';
import { createPdb } from './pdbs';
import { AutoNegConfigEntry, createK8sService } from './service';
import { monitoringState } from '../monitoring/state';
import { deepMerge } from '@tw/helpers';

export type DeployToK8sArgs = {
  name?: string;
  serviceAccount?: GCPServiceAccount;
  createK8sDeploymentArgs?: Partial<CreateK8sDeploymentArgs>;
  secretVersion?: gcp.secretmanager.SecretVersion;
  providers?: K8sProvider[];
  domain?: TWDomain;
  ingresses?: IngressesConfig[];
  useTcpProbe?: boolean;
  ports?: kubernetes.types.input.core.v1.ContainerPort[];
};

type DeployToKnativeArgs = {
  name?: string;
  ingressMode?: IngressMode;
  domain?: TWDomain;
  serviceAccount: GCPServiceAccount;
  createKnativeServingArgs?: Partial<CreateKnativeServingArgs>;
};

export function deployToK8s(args: DeployToK8sArgs): {
  k8sDeployment?: kubernetes.apps.v1.Deployment;
  deployment: ServiceEntryDeployment;
  ingressesResult: ReturnType<typeof k8sDiscovery>[];
} {
  const { serviceId } = getConfigs();
  const {
    createK8sDeploymentArgs,
    ingresses = [{ ingressMode: 'internal', ingressType: 'service' }],
    name = serviceId,
    serviceAccount,
    secretVersion,
    providers = [getK8sProvider()],
    useTcpProbe = false,
    ports = [{ containerPort: 8080 }],
  } = args;
  monitoringState.k8s.enabled = true;
  if (ports?.length) {
    monitoringState.apmHttp.enabled = true;
  }

  const deployment: ServiceEntryDeployment = {
    name: name,
    endpoints: {},
  };

  let k8sDeployment = null;
  const isMain = name == serviceId;
  const sub = isMain ? serviceId : `${name}.${serviceId}`;
  const domain = args.domain || new TWDomain(defaultDomain, sub, 'srv');

  for (const provider of providers) {
    createK8sNamespace({ provider });

    const args: CreateK8sDeploymentArgs = {
      name,
      provider,
      ...createK8sDeploymentArgs,
      podArgs: deepMerge(
        {
          terminationGracePeriodSeconds: 60,
          useTcpProbe,
          ports,
        },
        createK8sDeploymentArgs?.podArgs
      ),
    };

    if (serviceAccount !== null) {
      const k8sServiceAccount = createK8sServiceAccount({
        serviceAccount,
        provider,
      }).k8sServiceAccount;
      if (k8sServiceAccount) {
        args.podArgs.k8sServiceAccountName = k8sServiceAccount.metadata.name;
      }
    }

    if (secretVersion) {
      const k8sSecret = createK8sSecret({ gcpSecretVersion: secretVersion, provider }).k8sSecret;
      args.podArgs.k8sSecret = k8sSecret;
    }

    k8sDeployment = createK8sDeployment(args).k8sDeployment;

    if (isProduction && !createK8sDeploymentArgs?.podArgs?.allowSpot) {
      createPdb({
        name,
        provider,
        labels: {
          'triplewhale.com/deployment': name,
        },
        minAvailable: '90%',
      });
    }
  }

  const autoNegConfigEntries: AutoNegConfigEntry[] = [];
  const ingressesResult: ReturnType<typeof k8sDiscovery>[] = [];
  if (!(ports && !ports.length)) {
    for (const ingress of ingresses || []) {
      const { ingressMode, ingressType, loadBalancerConfig } = ingress;
      const res = k8sDiscovery({
        name,
        deployment,
        ingressMode,
        ingressType,
        provider: providers[0],
        domain,
        loadBalancerConfig,
        useTcpProbe,
      });
      ingressesResult.push(res);
      const { autoNegConfigEntry } = res;
      if (autoNegConfigEntry) {
        autoNegConfigEntries.push(autoNegConfigEntry);
      }
    }

    if (autoNegConfigEntries.length) {
      for (const provider of providers) {
        createK8sService({
          name,
          autoNeg: {
            backend_services: { '80': autoNegConfigEntries },
          },
          provider,
        });
      }
    }

    if (!deployment.endpoints['authenticated']) {
      deployment.endpoints['authenticated'] = {
        type: 'authenticated',
        audience: serviceId,
        url: createAuthProxyUrl(domain.subDomain || serviceId) as any,
      };
    }

    // deployment.endpoints['cluster-local'] = {
    //   type: 'cluster-local',
    //   url: 'http://' + createClusterLocalDnsName(name),
    //   cluster: provider.cluster_urn,
    // };
    addServiceEntryDeployment({ deployment, type: 'k8s' });
  }

  return { k8sDeployment, deployment, ingressesResult };
}

export function deployToKnative(args: DeployToKnativeArgs) {
  const { serviceId } = getConfigs();
  const { ingressMode, name = serviceId, createKnativeServingArgs = {}, serviceAccount } = args;
  const provider = getKnativeProvider();
  monitoringState.k8s.enabled = true;
  monitoringState.apmHttp.enabled = true;
  createK8sNamespace({ provider: provider });

  const k8sServiceAccount = createK8sServiceAccount({
    serviceAccount,
    provider,
  }).k8sServiceAccount;

  const deployment: ServiceEntryDeployment = {
    name: name,
    endpoints: {},
  };

  const isMain = name == serviceId;
  const sub = isMain ? serviceId : `${name}.${serviceId}`;
  const domain = args.domain || new TWDomain(defaultDomain, sub, 'srv');
  const { knativeServing } = createKnativeServing(
    {
      name,
      ...createKnativeServingArgs,
      podArgs: {
        k8sServiceAccountName: k8sServiceAccount.metadata.name,
        ...createKnativeServingArgs.podArgs,
      },
    },
    domain
  );

  if (isProduction) {
    createPdb({
      name,
      provider,
      labels: {
        'triplewhale.com/deployment': name,
      },
      minAvailable: '90%',
    });
  }

  const { dnsRecord: internalDnsRecord } = createKnativeDomainMapping({
    mode: 'internal',
    twDomain: domain,
    provider,
  });
  deployment.endpoints['internal'] = {
    type: 'internal',
    url: dnsUrl(internalDnsRecord) as any,
    cluster: provider.cluster_urn,
  };

  if (ingressMode === 'open') {
    const twDomain = createTWDomain({ twDomain: domain, domainGroup: 'api' });
    const { dnsRecord } = createKnativeDomainMapping({
      mode: ingressMode,
      twDomain,
      provider,
    });
    deployment.endpoints['open'] = { type: 'open', url: dnsUrl(dnsRecord) as any };
  }
  deployment.endpoints['authenticated'] = {
    type: 'authenticated',
    audience: serviceId,
    url: createAuthProxyUrl(domain.subDomain) as any,
  };
  // deployment.endpoints['cluster-local'] = {
  //   type: 'cluster-local',
  //   url: 'http://' + createClusterLocalDnsName(name),
  //   cluster: provider.cluster_urn,
  // };
  addServiceEntryDeployment({ deployment, type: 'k8s' });
  return { deployment, knativeServing };
}

export function createUfDeployment(args: DeployToKnativeArgs) {
  deployToKnative({
    name: 'uf',
    serviceAccount: args.serviceAccount,
    createKnativeServingArgs: {
      timeoutSeconds: 300,
      maxReplicas: 100,
      minReplicas: 1,
      podArgs: {
        memoryRequest: '1Gi',
        CPURequest: '500m',
        nodeSelector: {
          'cloud.google.com/machine-family': 'c2',
        },
      },
      target: 6,
      ...args.createKnativeServingArgs,
    },
  });
}
