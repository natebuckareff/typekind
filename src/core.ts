import { Json } from './json.js';
import { SchemaError } from './schema-error.js';

export const schemaSymbol = Symbol('schema');

export interface Schema<T> {
  readonly [schemaSymbol]: typeof schemaSymbol;
  readonly Type: T;

  serialize(input: T, ctx: Context): Json | SchemaError;
  stringify(input: T, ctx: Context): string | SchemaError;

  parse(input: string, ctx: Context): T | SchemaError;
  deserialize(input: unknown, ctx: Context): T | SchemaError;

  serializeSchema(): Json | SchemaError;
}

export function isSchema(value: unknown): value is Schema<unknown> {
  return typeof value === 'object' && value !== null && schemaSymbol in value;
}

export class Context {
  constructor(public readonly path: (string | number)[] = []) {}

  appendPath(path: string | number): Context {
    return new Context([...this.path, path]);
  }
}

export function serialize<S extends Schema<any>>(
  schema: S,
  input: S['Type'],
  ctx?: Context,
): Json | SchemaError {
  return schema.serialize(input, ctx ?? new Context());
}

export function stringify<S extends Schema<any>>(
  schema: S,
  input: S['Type'],
  ctx?: Context,
): string | SchemaError {
  return schema.stringify(input, ctx ?? new Context());
}

export function parse<S extends Schema<any>>(
  schema: S,
  input: string,
  ctx?: Context,
): S['Type'] | SchemaError {
  return schema.parse(input, ctx ?? new Context());
}

export function deserialize<S extends Schema<any>>(
  schema: S,
  input: unknown,
  ctx?: Context,
): S['Type'] | SchemaError {
  return schema.deserialize(input, ctx ?? new Context());
}
