export function getEnvs() {
  const result = { ...process.env };
  delete result['TW_DD'];
  return result;
}
