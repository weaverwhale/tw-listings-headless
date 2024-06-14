import * as datadog from '@pulumi/datadog';
import * as pulumi from '@pulumi/pulumi';
import { ServiceConfig } from '@tw/types';
import { createLabels, getConfigs } from '../utils';
import { getGitFullUrl } from '../utils/git';
import { getDatadogProvider } from './provider';
import { DatadogService } from './types';
import { getAlertEmails } from '../monitoring';
import { toYamlOutput } from '../pulumi-utils';

export function createDatadogService(args: {
  serviceConfig: ServiceConfig;
  datadogDashboard: datadog.Dashboard;
}) {
  const { serviceId } = getConfigs();
  const serviceDefinition: DatadogService = {
    contacts: getAlertEmails().map((contact) => {
      return {
        contact: contact,
        name: contact,
        type: 'email',
      };
    }),
    'dd-service': serviceId,
    links: [
      {
        name: 'Default Dashboard',
        type: 'dashboard',
        url: pulumi.interpolate`https://us5.datadoghq.com${args.datadogDashboard.url}`,
      },
    ],
    repos: [
      {
        name: 'github',
        provider: 'github',
        url: pulumi.output(getGitFullUrl()),
      },
    ],
    'schema-version': 'v2',
    tags: createLabels(true),
  };
  const service = new datadog.ServiceDefinitionYaml(
    'service-definition',
    {
      serviceDefinition: toYamlOutput(pulumi.output(serviceDefinition)),
    },
    { provider: getDatadogProvider() }
  );
  return service;
}
