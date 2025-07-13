import { Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';

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

  serialize(input: U64): Json | Error {
    return input.toString();
  }

  stringify(input: U64): string | TypeError | Error {
    return stringifyJson(input.toString());
  }

  parse(input: string): U64 | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): U64 | Error {
    if (typeof input !== 'string') {
      return Error('invalid type');
    }

    if (!u64Regex.test(input)) {
      return Error('not a number');
    }

    const value = BigInt(input);

    if (!isU64(value)) {
      return Error('invalid u64');
    }

    return value;
  }

  serializeSchema(): Json | Error {
    return 'u64';
  }
}
