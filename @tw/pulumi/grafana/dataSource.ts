import * as grafana from '@pulumiverse/grafana';
import { getGrafanaProvider } from './provider';

export function createGrafanaDataSource(args: {
  name: string;
  url: string;
  type: 'prometheus';
  jsonData: any;
}) {
  const { name, url, type, jsonData } = args;
  const dataSource = new grafana.DataSource(
    name,
    {
      name: `${name}-${type}`,
      type,
      jsonDataEncoded: JSON.stringify({
        ...jsonData,
      }),
      isDefault: false,
      accessMode: 'proxy',
      orgId: '1',
      url,
    },
    { provider: getGrafanaProvider() }
  );
  return dataSource;
}
