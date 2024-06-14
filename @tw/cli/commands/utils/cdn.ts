import compute from '@google-cloud/compute';
import { cliConfig } from '../../config';

export async function invalidateCdnCache(argv) {
  const [urlMap, path] = argv._.slice(1);
  const client = new compute.UrlMapsClient();
  const result = await client.invalidateCache({
    project: cliConfig.projectId,
    urlMap,
    cacheInvalidationRuleResource: { path: path || '/*' },
  });
  console.log(result);
}
