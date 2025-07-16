import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';

const optionSymbol = Symbol('option');

export class OptionSchema<S extends Schema<any>>
  implements Schema<S['Type'] | undefined>
{
  readonly [optionSymbol] = undefined!;
  readonly [schemaSymbol] = undefined!;
  readonly Type: S['Type'] | undefined = undefined!;

  constructor(readonly spec: S) {}

  serialize(input: S['Type'] | undefined): Json | Error {
    if (input === undefined) {
      return null;
    }

    const serializedValue = this.spec.serialize(input);

    if (serializedValue instanceof Error) {
      return serializedValue;
    }

    return serializedValue;
  }

  stringify(value: S['Type'] | undefined): string | TypeError | Error {
    const serialized = this.serialize(value);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized);
  }

  parse(input: string): S['Type'] | undefined | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: Json): S['Type'] | undefined | Error {
    if (input === null) {
      return undefined;
    }

    const deserializedValue = this.spec.deserialize(input);

    if (deserializedValue instanceof Error) {
      return deserializedValue;
    }

    return deserializedValue;
  }

  serializeSchema(): Json | Error {
    const serializedSchema = this.spec.serializeSchema();

    if (serializedSchema instanceof Error) {
      return serializedSchema;
    }

    const schema: Json = {
      $type: 'option',
      param: serializedSchema,
    };

    return schema;
  }
}
