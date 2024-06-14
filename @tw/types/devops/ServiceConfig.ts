import { PolicyJobDefinition, SensoryPolicy, SensoryProvider } from '../sensory';

// open: public endpoint
// internal: internal endpoint (only accessible from within the vpc)
// authenticated: authenticated endpoint (only accessible with a valid token)
// cluster-local: cluster local endpoint (only accessible from within the cluster)

export type endpointType = 'open' | 'internal' | 'authenticated' | 'cluster-local';

export type ServiceEntryDeployment = {
  name: string;
  endpoints: {
    [e in endpointType]?: {
      url: string;
      type: e;
      audience?: string;
      cluster?: string;
    };
  };
};

export type ServiceConfig = {
  env?: any;
  color: string;
  dependencies?: string[];
  runtime?: 'node' | 'python';
  tags?: string[];
  serviceId?: string;
  maintainers: string[];
  contacts?: string[];
  k8s?: boolean;
  gitRepo?: string;
  version?: number;
  deployments: Record<
    string, // deployment name
    ServiceEntryDeployment
  >;
  sensory?: {
    provider: SensoryProvider;
    policies: SensoryPolicy<PolicyJobDefinition>[];
  };
};
