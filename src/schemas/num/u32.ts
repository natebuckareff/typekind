import { Context, Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';
import { SchemaError } from '../../schema-error.js';

export type U32 = number & { readonly u32: unique symbol };

export function isU32(value: number): value is U32 {
  return Number.isFinite(value) && value >>> 0 === value;
}

export function u32(value: number): U32 {
  return (value >>> 0) as U32;
}

export class U32Schema implements Schema<U32> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: U32 = undefined!;

  serialize(input: U32, ctx: Context): Json | SchemaError {
    return input;
  }

  stringify(input: U32, ctx: Context): string | SchemaError {
    return stringifyJson(input, ctx);
  }

  parse(input: string, ctx: Context): U32 | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): U32 | SchemaError {
    if (typeof input !== 'number') {
      return new SchemaError('invalid type', ctx);
    }

    if (!isU32(input)) {
      return new SchemaError('invalid u32', ctx);
    }

    return input;
  }

  serializeSchema(): Json | SchemaError {
    return 'u32';
  }
}
