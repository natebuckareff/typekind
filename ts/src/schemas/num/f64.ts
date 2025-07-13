import { Schema, schemaSymbol } from '../../core.js';
import { Json, parseJson, stringifyJson } from '../../json.js';

export class F64Schema implements Schema<number> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: number = undefined!;

  serialize(input: number): Json | Error {
    return input;
  }

  stringify(input: number): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): number | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): number | Error {
    if (typeof input !== 'number') {
      return Error('invalid type');
    }
    return input;
  }

  serializeSchema(): Json | Error {
    return 'f64';
  }
}
