import { Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';

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

  serialize(input: I32): Json | Error {
    return input;
  }

  stringify(input: I32): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): I32 | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): I32 | Error {
    if (typeof input !== 'number') {
      return Error('invalid type');
    }

    if (!isI32(input)) {
      return Error('invalid i32');
    }

    return input;
  }

  serializeSchema(): Json | Error {
    return 'i32';
  }
}
