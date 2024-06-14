import { Compute, GoogleAuth } from 'google-auth-library';
import { getIdentityToken } from '../../utils/gcloud';

export default async function printGcpToken(argv) {
  const authClient = new GoogleAuth();

  let token;
  if (!argv.sa) {
    token = await getIdentityToken();
  } else {
    token = await ((await authClient.getClient()) as Compute).fetchIdToken(argv.aud);
  }
  console.log(token);
}
