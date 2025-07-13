import { Json } from './json.js';

export const schemaSymbol = Symbol('schema');

export interface Schema<T> {
  readonly [schemaSymbol]: typeof schemaSymbol;
  readonly Type: T;

  serialize(input: T): Json | Error;
  stringify(input: T): string | TypeError | Error;

  parse(input: string): T | SyntaxError | Error;
  deserialize(input: unknown): T | Error;

  serializeSchema(): Json | Error;
}

export function isSchema(value: unknown): value is Schema<unknown> {
  return typeof value === 'object' && value !== null && schemaSymbol in value;
}
