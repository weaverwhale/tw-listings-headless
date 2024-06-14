import { getSecretFromManager } from '@tw/utils/module/secrets';

export async function printSecret(argv) {
  const name = argv.secret_name;
  const secret = await getSecretFromManager(name);
  console.log(secret);
}
