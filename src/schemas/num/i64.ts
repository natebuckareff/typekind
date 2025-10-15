import { Context, Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';
import { SchemaError } from '../../schema-error.js';

const i64Regex = /^(-+)?[0-9]+$/;

export type I64 = bigint & { readonly i64: unique symbol };

export function isI64(value: bigint): value is I64 {
  return BigInt.asIntN(64, value) === value;
}

export function i64(value: bigint): I64 {
  if (typeof value === 'bigint') {
    return BigInt.asIntN(64, value) as I64;
  } else {
    return BigInt.asIntN(64, BigInt(value)) as I64;
  }
}

export class I64Schema implements Schema<I64> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: I64 = undefined!;

  serialize(input: I64, ctx: Context): Json | SchemaError {
    return input.toString();
  }

  stringify(input: I64, ctx: Context): string | SchemaError {
    return stringifyJson(input.toString(), ctx);
  }

  parse(input: string, ctx: Context): I64 | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): I64 | SchemaError {
    if (typeof input !== 'string') {
      return new SchemaError('invalid type', ctx);
    }

    if (!i64Regex.test(input)) {
      return new SchemaError('not a number', ctx);
    }

    const value = BigInt(input);

    if (!isI64(value)) {
      return new SchemaError('invalid i64', ctx);
    }

    return value;
  }

  serializeSchema(): Json | SchemaError {
    return 'i64';
  }
}
