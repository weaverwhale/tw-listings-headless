import { getSecretFromManager } from './getFromManager';

async function downloadSecrets() {
  const responsePayload = await getSecretFromManager(process.env.TW_SECRET_NAME);
  console.log(responsePayload);
}

downloadSecrets();
