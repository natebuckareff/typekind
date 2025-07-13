import { Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';

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

  serialize(input: I64): Json | Error {
    return input.toString();
  }

  stringify(input: I64): string | TypeError | Error {
    return stringifyJson(input.toString());
  }

  parse(input: string): I64 | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): I64 | Error {
    if (typeof input !== 'string') {
      return Error('invalid type');
    }

    if (!i64Regex.test(input)) {
      return Error('not a number');
    }

    const value = BigInt(input);

    if (!isI64(value)) {
      return Error('invalid i64');
    }

    return value;
  }

  serializeSchema(): Json | Error {
    return 'i64';
  }
}
