import { Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';

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

  serialize(input: U32): Json | Error {
    return input;
  }

  stringify(input: U32): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): U32 | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): U32 | Error {
    if (typeof input !== 'number') {
      return Error('invalid type');
    }

    if (!isU32(input)) {
      return Error('invalid u32');
    }

    return input;
  }

  serializeSchema(): Json | Error {
    return 'u32';
  }
}
