import SemVer = require('semver/classes/semver');
import { getCurrentBranch } from './git';
import { getGitSha } from '@tw/devops';

export async function pipVersion(currentVersion: string, type: 'patch' | 'prerelease') {
  const semver = new SemVer(currentVersion);
  let version;
  let versionSuffix: string;
  if (type === 'prerelease') {
    const branch = await getCurrentBranch();
    const sha = (await getGitSha()).slice(0, 7);
    versionSuffix = `${branch}.${sha}`.replaceAll('-', '.');
    version = semver.inc(type, versionSuffix);
  } else {
    version = semver.inc(type);
  }
  if (versionSuffix) {
    versionSuffix = `+${versionSuffix}`;
    version.version = version.version.slice(0, -2);
  }
  return { version: version.version, versionSuffix };
}
