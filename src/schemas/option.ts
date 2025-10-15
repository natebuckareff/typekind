import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';

const optionSymbol = Symbol('option');

export class OptionSchema<S extends Schema<any>>
  implements Schema<S['Type'] | undefined>
{
  readonly [optionSymbol] = undefined!;
  readonly [schemaSymbol] = undefined!;
  readonly Type: S['Type'] | undefined = undefined!;

  constructor(readonly spec: S) {}

  serialize(input: S['Type'] | undefined, ctx: Context): Json | SchemaError {
    if (input === undefined) {
      return null;
    }

    const nextCtx = ctx.appendPath(0);
    const serializedValue = this.spec.serialize(input, nextCtx);

    if (serializedValue instanceof Error) {
      return serializedValue;
    }

    return serializedValue;
  }

  stringify(value: S['Type'] | undefined, ctx: Context): string | SchemaError {
    const serialized = this.serialize(value, ctx);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized, ctx);
  }

  parse(input: string, ctx: Context): S['Type'] | undefined | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: Json, ctx: Context): S['Type'] | undefined | SchemaError {
    if (input === null) {
      return undefined;
    }

    const deserializedValue = this.spec.deserialize(input, ctx);

    if (deserializedValue instanceof Error) {
      return deserializedValue;
    }

    return deserializedValue;
  }

  serializeSchema(): Json | SchemaError {
    const serializedSchema = this.spec.serializeSchema();

    if (serializedSchema instanceof SchemaError) {
      return serializedSchema;
    }

    const schema: Json = {
      $type: 'option',
      param: serializedSchema,
    };

    return schema;
  }
}
