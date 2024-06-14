export default function getIntegrationsRedisKey(provider_id: string, state) {
  return `integration#${provider_id}#oauth-states#${state}`;
}
