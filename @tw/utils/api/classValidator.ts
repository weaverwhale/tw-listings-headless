import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { OpenAPIV3 } from 'openapi-types';

export function ApiProperty(options?: OpenAPIV3.SchemaObject) {
  return JSONSchema(options as any);
}

@ValidatorConstraint()
export class IsStringOrNumber implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must be number or string';
  }
}

@ValidatorConstraint()
export class IsStringOrNumberOrBoolean implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string' || typeof text === 'boolean';
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must be number or string or boolean';
  }
}

@ValidatorConstraint({ name: 'isBeforeOrEqual', async: false })
export class IsBeforeOrEqualConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return propertyValue <= args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `'${args.property}' must be before of equal to '${args.constraints[0]}'`;
  }
}

export { Validate } from 'class-validator';
export { Type } from 'class-transformer';
