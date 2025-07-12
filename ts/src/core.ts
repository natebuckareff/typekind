import { Json } from './json.js';

export const schemaSymbol = Symbol('schema');

export interface Schema<T, M extends {} = {}> {
  readonly schema: typeof schemaSymbol;
  readonly Type: T;
  readonly Metadata: M;

  serialize(input: T): Json | Error;
  stringify(input: T): string | TypeError | Error;

  parse(input: string): T | SyntaxError | Error;
  deserialize(input: unknown): T | Error;
}

export type ObjectSpec = {
  [property: string]: Schema<any>;
};

export type InferType<S> = S extends Schema<infer T>
  ? T
  : S extends ObjectSpec
  ? InferObjectType<S>
  : never;

export type InferObjectType<S extends ObjectSpec> = {
  [K in keyof S]: S[K] extends Schema<infer T> ? T : never;
};

export function metadataIsOptional<M extends {}>(metadata: M): boolean {
  return 'optional' in metadata && metadata.optional === true;
}

export function serializeSchema<T, M extends {}>(
  typeName: string[],
  schema: Schema<T, M>,
  version: string,
): Json | Error {
  for (const part of typeName) {
    if (part.includes('.')) {
      return Error('invalid schema type name');
    }
  }

  const outer = {
    $schema: `${typeName.join('.')}`,
  };

  throw Error('todo');
}
