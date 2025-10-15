import { Context, Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';
import { SchemaError } from '../../schema-error.js';

const u64Regex = /^[0-9]+$/;

export type U64 = bigint & { readonly u64: unique symbol };

export function isU64(value: bigint): value is U64 {
  return BigInt.asUintN(64, value) === value;
}

export function u64(value: bigint | number | string): U64 {
  if (typeof value === 'bigint') {
    return BigInt.asUintN(64, value) as U64;
  } else {
    return BigInt.asUintN(64, BigInt(value)) as U64;
  }
}

export class U64Schema implements Schema<U64> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: U64 = undefined!;

  serialize(input: U64, ctx: Context): Json | SchemaError {
    return input.toString();
  }

  stringify(input: U64, ctx: Context): string | SchemaError {
    return stringifyJson(input.toString(), ctx);
  }

  parse(input: string, ctx: Context): U64 | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): U64 | SchemaError {
    if (typeof input !== 'string') {
      return new SchemaError('invalid type', ctx);
    }

    if (!u64Regex.test(input)) {
      return new SchemaError('not a number', ctx);
    }

    const value = BigInt(input);

    if (!isU64(value)) {
      return new SchemaError('invalid u64', ctx);
    }

    return value;
  }

  serializeSchema(): Json | SchemaError {
    return 'u64';
  }
}
