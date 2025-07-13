import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';

export class BoolSchema implements Schema<boolean> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: boolean = undefined!;

  serialize(input: boolean): Json | Error {
    return input;
  }

  stringify(input: boolean): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): boolean | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): boolean | Error {
    if (typeof input !== 'boolean') {
      return Error('invalid type');
    }
    return input;
  }

  serializeSchema(): Json | Error {
    return 'bool';
  }
}
