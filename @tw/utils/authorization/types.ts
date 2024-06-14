import { type OnlyStringKeys } from '@tw/types';

type EmptyObj = Record<string, never>;

type Schema = { readonly [x: string]: Definition };

type Definition<
  Key extends string = string,
  R extends Relations = Relations,
  P extends Permissions = Permissions,
> = EmptyObj | { readonly relations: R; readonly permissions: P };

type Relations = { readonly [r: string]: Relation };

type Relation = {
  readonly [s: string]: { readonly [ss: string]: EmptyObj };
};

type IntersectOf<U extends any> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Overwrite<O extends object, O1 extends object> = {
  [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};

type Merge<U extends object> = IntersectOf<
  Overwrite<
    U,
    {
      [K in keyof U]-?: U[K] extends object ? Merge<U[K]> : U[K];
    }
  >
>;

type ResourceRelationKeys<S extends Schema, K extends OnlyStringKeys<S>> = OnlyStringKeys<
  S[K]['relations']
>;

type ResourcePermissionKeys<S extends Schema, K extends OnlyStringKeys<S>> = OnlyStringKeys<
  S[K]['permissions']
>;

type ValidRelationSubjects<
  S extends Schema,
  K extends OnlyStringKeys<S>,
  R extends ResourceRelationKeys<S, K>,
> = OnlyStringKeys<Merge<S[K]['relations'][R]>> & OnlyStringKeys<S>;

type ValidPermissionSubjects<S extends Schema, K extends OnlyStringKeys<S>> = K;

type AnySchemaRelationName<S extends Schema> = OnlyStringKeys<Merge<S[keyof S]['relations']>>;

type Permissions = { readonly [p: string]: Permission };

type Permission = { readonly [s: string]: { readonly [ss: string]: EmptyObj } };

type SpiceSchemaString = `definition${string}`;

export {
  Definition,
  Permission,
  Permissions,
  Relation,
  Relations,
  Schema,
  SpiceSchemaString,
  ResourceRelationKeys,
  ResourcePermissionKeys,
  ValidRelationSubjects,
  ValidPermissionSubjects,
  AnySchemaRelationName,
};
