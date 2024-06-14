import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function getSecretFromManager(
  name: string,
  version: string = 'latest'
): Promise<string> {
  if (!name.startsWith('projects/')) {
    name = `projects/${process.env.PROJECT_ID}/secrets/${name}/versions/${version}`;
  }
  const client = new SecretManagerServiceClient();
  const [accessResponse] = await client.accessSecretVersion({
    name: name,
  });
  return accessResponse.payload.data.toString();
}
