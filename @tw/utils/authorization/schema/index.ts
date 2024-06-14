import { type TWSpiceResources } from '@tw/types';

import account from './account';
import business_unit from './businessUnit';
import dashboard from './dashboard';
import group from './group';
import integration from './integration';
import provider from './provider';
import user from './user';
import { translateSchema, checkTWSchema } from './translate';

const schema = `
${user}
${group}
${account}
${business_unit}
${provider}
${integration}
${dashboard}
`;

const schemaAsObject = translateSchema(schema);

checkTWSchema(schemaAsObject);

export const TW_SCHEMA_STRING = schema;
export const TW_SCHEMA = schemaAsObject;
export type TWSchema = typeof TW_SCHEMA;
