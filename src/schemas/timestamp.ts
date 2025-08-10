import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';

export class TimestampSchema implements Schema<Date> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: Date = undefined!;

  serialize(input: Date, ctx: Context): Json | SchemaError {
    return input.getTime();
  }

  stringify(input: Date, ctx: Context): string | SchemaError {
    return stringifyJson(input.getTime(), ctx);
  }

  parse(input: string, ctx: Context): Date | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): Date | SchemaError {
    if (typeof input !== 'number') {
      return new SchemaError('invalid type', ctx);
    }

    if (!Number.isSafeInteger(input)) {
      return new SchemaError('invalid timestamp', ctx);
    }

    return new Date(input);
  }

  serializeSchema(): Json | SchemaError {
    return 'timestamp';
  }
}
