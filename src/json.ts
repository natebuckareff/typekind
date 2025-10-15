import { Context, Schema, schemaSymbol } from './core.js';
import { SchemaError } from './schema-error.js';

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export class JsonSchema implements Schema<Json> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: Json = undefined!;

  serialize(input: Json): Json | SchemaError {
    return input;
  }

  stringify(input: Json, ctx: Context): string | SchemaError {
    return stringifyJson(input, ctx);
  }

  parse(input: string, ctx: Context): Json | SchemaError {
    return parseJson(input, ctx);
  }

  deserialize(input: Json): Json | SchemaError {
    return input;
  }

  serializeSchema(): Json | SchemaError {
    return 'json';
  }
}

export function stringifyJson(json: Json, ctx: Context): string | SchemaError {
  try {
    return JSON.stringify(json);
  } catch (error) {
    if (error instanceof TypeError) {
      return new SchemaError('json stringify error', ctx, error);
    } else {
      throw error;
    }
  }
}

export function parseJson(input: string, ctx: Context): Json | SchemaError {
  try {
    return JSON.parse(input);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return new SchemaError('json parsing error', ctx, error);
    } else {
      throw error;
    }
  }
}
