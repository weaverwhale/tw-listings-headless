import { TWSpiceResources } from '@tw/types';
import { type Schema, type Definition, type Relation, type Permission } from '../types';

export function translateSchema(spiceDBString: string): Schema {
  const definitions = spiceDBString
    .split('definition')
    .slice(1)
    .map((s) => s.trim())
    .map((s) => `definition ${s}`);
  return definitions.reduce((acc, d) => ({ ...acc, ...translateDefinition(d) }), {});
}

export function checkTWSchema(schema: Schema) {
  for (let key of Object.keys(schema)) {
    if (!(TWSpiceResources as any).includes(key)) {
      throw new Error(`Spice schema has an invalid resource: ${key}!`);
    }
  }
  for (let required of TWSpiceResources) {
    if (!schema[required]) {
      throw new Error(`Spice schema is missing a resource: ${required}!`);
    }
  }
}

function translateDefinition(str: string): { [key: string]: Definition } {
  const name = getName(str);
  const relations = getRelations(str);
  const permissions = getPermissions(str);
  const definitionObj = {
    relations: relations.reduce((acc, r) => ({ ...acc, ...translateRelation(r) }), {}),
    permissions: permissions.reduce((acc, p) => ({ ...acc, ...translatePermission(p) }), {}),
  };
  return { [name]: definitionObj };
}

function translatePermission(str: string): Permission {
  const [_, permission] = str.trim().split('permission');
  const [name, subjects] = permission
    .trim()
    .split('=')
    .map((s) => s.trim());
  const subjectList = subjects
    .trim()
    .split('+')
    .map((s) => s.trim());
  const relationObj = subjectList.reduce((acc, sub) => {
    const [subject, subPermission] = sub.trim().split('->');
    acc = { ...acc, [subject]: {} };
    if (subPermission) {
      acc[subject] = { [subPermission]: {} };
    }
    return acc;
  }, {});
  return { [name]: relationObj };
}

function translateRelation(str: string): Relation {
  const [_, relation] = str.trim().split('relation');
  const [name, subjects] = relation
    .trim()
    .split(':')
    .map((s) => s.trim());
  const subjectList = subjects
    .trim()
    .split('|')
    .map((s) => s.trim());
  const relationObj = subjectList.reduce((acc, sub) => {
    const [subject, subRelation] = sub.trim().split('#');
    acc = { ...acc, [subject]: {} };
    if (subRelation) {
      acc[subject] = { [subRelation]: {} };
    }
    return acc;
  }, {});
  return { [name]: relationObj };
}

function getName(str: string): string {
  const [_, name] = str.trim().split('definition');
  return name.trim().split('{')[0].trim();
}

function getRelations(str: string): Array<string> {
  const [_, definition] = str.trim().split('{');
  return definition
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('relation'));
}

function getPermissions(str: string): Array<string> {
  const [_, definition] = str.trim().split('{');
  return definition
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('permission'));
}

export const _test = {
  translateDefinition,
  translatePermission,
  translateRelation,
  getName,
  getRelations,
  getPermissions,
};
