export const cloudFlareDomainMap = {
  'whale.camera': '7d258d8677d057ee61f72fe7b7de4406',
  'config-security.com': '38abe6948e2f6b3608727cb372e3af63',
  'whale3.io': 'd4696f0ddcfba625f989a68a86b80db8',
  'triplewhale.com': 'b5ad17cb0720654650cd0f0ce61b33d9',
  'whaledb.io': '737f70f0c8bbde9e15738f21035950ed',
  'triplestack.io': '30ea7bb6a4317ebf1508eacfc2ec62a8',
};

export function getCloudFlareZone(domainName: string) {
  return cloudFlareDomainMap[domainName];
}

export const cloudFlareAccountId = '8aba1045308f729cc27d0e25b5f1f301';
