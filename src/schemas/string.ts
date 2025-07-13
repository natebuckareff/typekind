import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';

export class StringSchema implements Schema<string> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: string = undefined!;

  serialize(input: string): Json | Error {
    return input;
  }

  stringify(input: string): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): string | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): string | Error {
    if (typeof input !== 'string') {
      return Error('invalid type');
    }
    return input;
  }

  serializeSchema(): Json | Error {
    return 'string';
  }
}
