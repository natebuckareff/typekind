import { Context, Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';
import { SchemaError } from '../../schema-error.js';

export class F64Schema implements Schema<number> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: number = undefined!;

  serialize(input: number, ctx: Context): Json | SchemaError {
    return input;
  }

  stringify(input: number, ctx: Context): string | SchemaError {
    return stringifyJson(input, ctx);
  }

  parse(input: string, ctx: Context): number | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): number | SchemaError {
    if (typeof input !== 'number') {
      return new SchemaError('invalid type', ctx);
    }
    return input;
  }

  serializeSchema(): Json | SchemaError {
    return 'f64';
  }
}
