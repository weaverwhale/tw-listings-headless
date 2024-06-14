import { cliConfig } from '../config';

export const dockers: Record<
  string,
  { config: (projectId?: any) => string; keepFresh?: boolean; detach?: boolean; color: string }
> = {
  emulators: {
    config: (projectId) => {
      const serviceName = 'emulators';
      return JSON.stringify({
        version: '3.8',
        services: {
          [serviceName]: {
            image:
              'us-central1-docker.pkg.dev/triple-whale-staging/devops-docker/local-emulators:latest',
            environment: {
              IS_LOCAL: 'true',
              PROJECT_ID: projectId,
            },
            ports: ['8065:8065', '8086:8086', '8090:8090', '8026:8026', '8027:8027'],
            volumes: [
              'emulators-cache:/root/.cache/firebase/emulators/',
              `${process.env.HOME}/.config/gcloud:/root/.config/gcloud`,
            ],
            networks: getServiceNetwork(serviceName),
          },
        },
        volumes: {
          [`${serviceName}-cache`]: null,
        },
        ...getNetworks(serviceName),
      });
    },
    keepFresh: true,
    detach: true,
    color: '2496ec',
  },
  redis: {
    config: () => {
      const serviceName = 'redis';
      return JSON.stringify({
        version: '3.8',
        services: {
          [serviceName]: {
            image: serviceName,
            ports: ['6379:6379'],
            networks: getServiceNetwork(serviceName),
          },
        },
        ...getNetworks(serviceName),
      });
    },
    color: 'c6302b',
  },
  postgres: {
    config: () => {
      const serviceName = 'postgres';
      return JSON.stringify({
        version: '3.8',
        services: {
          [serviceName]: {
            image: serviceName,
            ports: ['5432:5432'],
            environment: {
              POSTGRES_PASSWORD: 'local-pass',
              POSTGRES_USER: 'local-user',
            },
            volumes: ['postgres-cache:/var/lib/postgresql/data'],
            networks: getServiceNetwork(serviceName),
          },
        },
        volumes: {
          'postgres-cache': null,
        },
        ...getNetworks(serviceName),
      });
    },
    color: '336691',
  },
  mongo: {
    config: () => {
      const serviceName = 'mongo';
      return JSON.stringify({
        version: '3.8',
        services: {
          [serviceName]: {
            image: 'mongo',
            ports: ['27017:27017'],
            volumes: ['mongo-cache:/data/db'],
            networks: getServiceNetwork(serviceName),
          },
        },
        volumes: {
          'mongo-cache': null,
        },
        ...getNetworks(serviceName),
      });
    },
    color: '10ab50',
  },
  temporal: {
    config: () => {
      const serviceName = 'temporal';
      return JSON.stringify({
        version: '3.8',
        services: {
          [serviceName]: {
            image:
              'us-central1-docker.pkg.dev/triple-whale-staging/devops-docker/local-temporal:latest',
            ports: ['7233:7233', '7080:7080'],
            networks: getServiceNetwork(serviceName),
          },
        },
        ...getNetworks(serviceName),
      });
    },
    keepFresh: true,
    // detach: true,
    color: '42f5a1',
  },
  spicedb: {
    config: () => {
      const serviceName = 'spicedb';
      const pg = JSON.parse(dockers.postgres.config());
      return JSON.stringify({
        version: '3.8',
        services: {
          [serviceName]: {
            environment: {
              // should match env in tw-config.json
              SPICEDB_GRPC_PRESHARED_KEY: 'moSalahMVP',
              ...pg.services.postgres.environment,
            },
            image: 'authzed/spicedb:latest',
            ports: ['50051:50051'],
            networks: getServiceNetwork(serviceName),
            command: 'serve',
          },
        },
        volumes: {
          ...pg.volumes,
        },
        ...getNetworks(serviceName),
      });
    },
    color: '9b533f',
  },
};

function getNetworks(serviceName) {
  return {
    networks: {
      [`${serviceName}-network`]: {
        external: false,
        name: `${serviceName}-network`,
      },
    },
  };
}

function getServiceNetwork(serviceName) {
  return [`${serviceName}-network`];
}
