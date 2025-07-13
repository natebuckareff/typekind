import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';

export class TimestampSchema implements Schema<Date> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: Date = undefined!;

  serialize(input: Date): Json | Error {
    return input.getTime();
  }

  stringify(input: Date): string | TypeError | Error {
    return stringifyJson(input.getTime());
  }

  parse(input: string): Date | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): Date | Error {
    if (typeof input !== 'number') {
      return Error('invalid type');
    }

    if (!Number.isSafeInteger(input)) {
      return Error('invalid timestamp');
    }

    return new Date(input);
  }

  serializeSchema(): Json | Error {
    return 'timestamp';
  }
}
