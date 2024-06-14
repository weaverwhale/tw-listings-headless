import { TW_SCHEMA } from './schema';
import { type RelationParams } from './addRelations';

export function validateOneRelation({
  subjectId,
  subjectType,
  resourceId,
  resourceType,
  relation,
}: Omit<RelationParams, 'subjectIds'>) {
  const errors: string[] = [];
  if (!resourceType) {
    errors.push('Resource type is required');
  }
  if (!relation) {
    errors.push('Relation is required');
  }
  if (!subjectType) {
    errors.push('Subject type is required');
  }
  if (!resourceId) {
    errors.push('Resource id is required');
  }
  if (!subjectId) {
    errors.push('Subject id is required');
  }
  if (errors.length) {
    return errors;
  }
  if (!TW_SCHEMA[resourceType]) {
    return [`No resource type ${resourceType} in authorization schema`];
  }
  if (!TW_SCHEMA[resourceType]?.['relations']?.[relation]) {
    return [`No relation ${relation} on resource type ${resourceType}`];
  }
  if (!TW_SCHEMA[subjectType]) {
    return [`No subject type ${subjectType} in authorization schema`];
  }
  if (!TW_SCHEMA[resourceType]?.['relations']?.[relation]?.[subjectType]) {
    return [
      `Subject type ${subjectType} is not valid for relation ${relation} in resource type ${resourceType}`,
    ];
  }
  return errors;
}

export function validateRelations({
  subjectIds,
  subjectId,
  subjectType,
  resourceId,
  resourceType,
  relation,
}: RelationParams) {
  subjectIds = [...(subjectIds || []), subjectId].map((id) => id ?? '');
  return subjectIds
    .map((id) => {
      if (!id) {
        return ['Subject id is required'];
      }
      return validateOneRelation({
        subjectId: id,
        subjectType,
        resourceId,
        resourceType,
        relation,
      });
    })
    .flat();
}
