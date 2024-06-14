import * as grafana from '@pulumiverse/grafana';
import { isStaging } from '../constants';

const grafanaProviders = {};

export function getGrafanaProvider(name: string = 'sonic-cluster') {
  if (!grafanaProviders[name]) {
    grafanaProviders[name] = new grafana.Provider(name, {
      url: `http://${isStaging ? 'stg.' : ''}${name}.grafana.internal.triplestack.io`,
      auth: 'admin:admin',
    });
  }
  return grafanaProviders[name];
}
