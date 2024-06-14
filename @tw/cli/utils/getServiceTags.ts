import * as ar from '@google-cloud/artifact-registry';
import { getAccessToken } from './gcloud';

let client;

export async function getServiceTags(serviceId: string): Promise<
  {
    commitSha: string;
    shortSha: string;
    created: string;
  }[]
> {
  try {
    if (!client) {
      client = new ar.ArtifactRegistryClient();
      await client.initialize();
    }
    // TODO - make it available in staging too??
    const versionResponse = await client.listVersions({
      parent: `projects/shofifi/locations/us-central1/repositories/cloud-run/packages/${serviceId}`,
      view: 'FULL',
    });
    return formatList(versionResponse[0]);
  } catch (e) {
    return [];
  }
}

type ARVersion = {
  relatedTags: {
    name: string;
    version: string;
  }[];
  createTime: {
    seconds: number;
    nanos: number;
  };
};

function formatList(list: ARVersion[]): {
  commitSha: string;
  shortSha: string;
  created: string;
}[] {
  return list
    .map((version, i) => {
      return {
        created: new Date(+`${version.createTime.seconds}000`),
        commitSha: version.relatedTags
          .map((obj) => obj.name.split('/').slice(-1)[0])
          .filter((t) => t !== 'latest')[0],
      };
    })
    .sort((a, b) => {
      return +b.created - +a.created;
    })
    .map((r) => {
      return {
        ...r,
        created: r.created.toLocaleString(),
        shortSha: r.commitSha?.slice(0, 7),
      };
    });
}
