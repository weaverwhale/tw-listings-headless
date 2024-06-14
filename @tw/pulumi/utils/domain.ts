import { getProjectSubDomain } from '@tw/constants';
import { getConfigs } from './getConfigs';
import { getUniqueNameInProject } from './getUniqueName';
import { cloudFlareDomainMap } from '../cloudflare';
import { defaultDomain } from '../constants';

export type Domain = keyof typeof cloudFlareDomainMap;

export class TWDomain {
  public readonly fullSubDomain: string;
  public readonly fqdn: string;
  constructor(
    public readonly domain: Domain,
    public readonly subDomain: string,
    public readonly domainGroup?: 'srv' | 'api' | 'internal' | 'iap',
    public projectSubDomain?: (projectId: string) => string
  ) {
    this.projectSubDomain = projectSubDomain || getProjectSubDomain;
    // full, including project prefix and project unique name
    this.fullSubDomain = this.getSubDomain(true);
    this.fqdn = getFQDN(this.fullSubDomain, domain);
  }

  getSubDomain(includeDomainGroup?: boolean): string {
    const { projectId } = getConfigs();
    let result = `${this.projectSubDomain(projectId)}${getUniqueNameInProject(this.subDomain)}`;
    if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }
    if (includeDomainGroup && this.domainGroup) {
      if (!result) {
        result = this.domainGroup;
      } else {
        result = result + '.' + this.domainGroup;
      }
    }
    return result;
  }
}

export function createTWDomain(args: {
  domain?: Domain;
  subDomain?: string;
  domainGroup?: 'srv' | 'api' | 'internal' | 'iap';
  projectSubDomain?: (projectId: string) => string;
  twDomain?: TWDomain;
}): TWDomain {
  const domain = args.domain || args.twDomain?.domain || defaultDomain;
  const subDomain = args.subDomain || args.twDomain?.subDomain;
  const domainGroup = args.domainGroup || args.twDomain?.domainGroup;
  const projectSubDomain = args.projectSubDomain || args.twDomain?.projectSubDomain;
  if (!domain) {
    throw new Error('Domain is required');
  }
  return new TWDomain(domain, subDomain, domainGroup, projectSubDomain);
}

export function getFQDN(subDomain: string, domain: string) {
  if (!subDomain) {
    return domain;
  }
  return `${subDomain}.${domain}`;
}

export function getLabelSafeDomain(twDomain: TWDomain) {
  let labelSafeDomain = twDomain.fqdn;
  if (labelSafeDomain.length > 63) {
    labelSafeDomain = labelSafeDomain.slice(0, 63);
    if (labelSafeDomain.endsWith('.')) {
      labelSafeDomain = labelSafeDomain.slice(0, 62);
    }
  }
  return labelSafeDomain;
}
