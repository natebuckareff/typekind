import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';

export class BoolSchema implements Schema<boolean> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: boolean = undefined!;

  serialize(input: boolean): Json | SchemaError {
    return input;
  }

  stringify(input: boolean, ctx: Context): string | SchemaError {
    return stringifyJson(input, ctx);
  }

  parse(input: string, ctx: Context): boolean | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof SchemaError) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): boolean | SchemaError {
    if (typeof input !== 'boolean') {
      return new SchemaError('invalid type', ctx);
    }
    return input;
  }

  serializeSchema(): Json | SchemaError {
    return 'bool';
  }
}
