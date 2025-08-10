import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';

export class StringSchema implements Schema<string> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: string = undefined!;

  serialize(input: string, ctx: Context): Json | SchemaError {
    return input;
  }

  stringify(input: string, ctx: Context): string | SchemaError {
    return stringifyJson(input, ctx);
  }

  parse(input: string, ctx: Context): string | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): string | SchemaError {
    if (typeof input !== 'string') {
      return new SchemaError('invalid type', ctx);
    }
    return input;
  }

  serializeSchema(): Json | SchemaError {
    return 'string';
  }
}
