import { getStoreKey } from '../twContext';

type GCPTags = 'action' | 'controller' | 'framework' | 'route' | 'application' | 'db driver';

export function addTags(sql: string, tags?: Record<GCPTags, string>): string {
  const allTags = { ...tags };
  const context = getStoreKey('context');
  if (context.req) {
    allTags.action = context.req.method;
    allTags.framework = 'express';
    allTags.route = context.req?.route?.path;
  }
  // https://google.github.io/sqlcommenter/spec/#format
  const tagsString = Object.entries(allTags)
    .map(([key, value]) => `${key}=${encodeURI(value)}`)
    .join(',');
  return `${sql} /* ${tagsString} */`;
}
