import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';

export class ArraySchema<S extends Schema<any>> implements Schema<S['Type'][]> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: S['Type'][] = undefined!;

  constructor(readonly spec: S) {}

  serialize(input: S['Type'][]): Json | Error {
    let out: Json[] | undefined;

    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      const serializedValue = this.spec.serialize(value);

      if (serializedValue instanceof Error) {
        return serializedValue;
      }

      if (value !== serializedValue) {
        out ??= [...input];
        out[i] = serializedValue;
      }
    }

    return out ?? (input as Json);
  }

  stringify(value: S['Type'][]): string | TypeError | Error {
    const serialized = this.serialize(value);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized);
  }

  parse(input: string): S['Type'][] | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: Json): S['Type'][] | Error {
    if (!Array.isArray(input)) {
      return new Error('non-array json');
    }

    let out: S['Type'][] | undefined;

    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      const deserializedValue = this.spec.deserialize(value);

      if (deserializedValue instanceof Error) {
        return deserializedValue;
      }

      if (value !== deserializedValue) {
        out ??= [...input];
        out[i] = deserializedValue;
      }
    }

    return out ?? input;
  }

  serializeSchema(): Json | Error {
    const serializedSchema = this.spec.serializeSchema();

    if (serializedSchema instanceof Error) {
      return serializedSchema;
    }

    return [serializedSchema];
  }
}
