import { Context, Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';
import { SchemaError } from '../../schema-error.js';

export type I32 = number & { readonly i32: unique symbol };

export function isI32(value: number): value is I32 {
  return Number.isFinite(value) && (value | 0) === value;
}

export function i32(value: number): I32 {
  return (value | 0) as I32;
}

export class I32Schema implements Schema<I32> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: I32 = undefined!;

  serialize(input: I32, ctx: Context): Json | SchemaError {
    return input;
  }

  stringify(input: I32, ctx: Context): string | SchemaError {
    return stringifyJson(input, ctx);
  }

  parse(input: string, ctx: Context): I32 | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): I32 | SchemaError {
    if (typeof input !== 'number') {
      return new SchemaError('invalid type', ctx);
    }

    if (!isI32(input)) {
      return new SchemaError('invalid i32', ctx);
    }

    return input;
  }

  serializeSchema(): Json | SchemaError {
    return 'i32';
  }
}
