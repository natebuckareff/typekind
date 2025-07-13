import { Schema, schemaSymbol } from './core.js';

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export class JsonSchema implements Schema<Json, {}> {
  readonly [schemaSymbol] = undefined!;
  readonly Type = undefined!;
  readonly Metadata = {};

  serialize(input: Json): Json | Error {
    return input;
  }

  stringify(input: Json): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): Json | SyntaxError | Error {
    return parseJson(input);
  }

  deserialize(input: Json): Json | Error {
    return input;
  }

  serializeSchema(): Json | Error {
    return 'json';
  }
}

export function stringifyJson(json: Json): string | TypeError {
  try {
    return JSON.stringify(json);
  } catch (error) {
    if (error instanceof TypeError) {
      return error;
    } else {
      throw error;
    }
  }
}

export function parseJson(input: string): Json | SyntaxError {
  try {
    return JSON.parse(input);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return error;
    } else {
      throw error;
    }
  }
}
