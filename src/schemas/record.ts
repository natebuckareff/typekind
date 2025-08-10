import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';

export class RecordSchema<S extends Schema<any>>
  implements Schema<Record<string, S['Type']>>
{
  readonly [schemaSymbol] = undefined!;
  readonly Type: Record<string, S['Type']> = undefined!;

  constructor(readonly spec: S) {}

  serialize(
    input: Record<string, S['Type']>,
    ctx: Context,
  ): Json | SchemaError {
    let out: { [key: string]: Json } | undefined;

    for (const key in input) {
      const value = input[key];
      const nextCtx = ctx.appendPath(key);
      const serializedValue = this.spec.serialize(value, nextCtx);

      if (serializedValue instanceof Error) {
        return serializedValue;
      }

      if (value !== serializedValue) {
        out ??= { ...(input as { [key: string]: Json }) };
        out[key] = serializedValue;
      }
    }

    return out ?? (input as Json);
  }

  stringify(
    value: Record<string, S['Type']>,
    ctx: Context,
  ): string | SchemaError {
    const serialized = this.serialize(value, ctx);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized, ctx);
  }

  parse(input: string, ctx: Context): Record<string, S['Type']> | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(
    input: Json,
    ctx: Context,
  ): Record<string, S['Type']> | SchemaError {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return new SchemaError('non-object json', ctx);
    }

    let out: { [key: string]: unknown } | undefined;

    for (const key in input) {
      const value = input[key];
      const nextCtx = ctx.appendPath(key);
      const deserializedValue = this.spec.deserialize(value, nextCtx);

      if (deserializedValue instanceof SchemaError) {
        return deserializedValue;
      }

      if (value !== deserializedValue) {
        out ??= { ...(input as { [key: string]: Json }) };
        out[key] = deserializedValue;
      }
    }

    return out ?? input;
  }

  serializeSchema(): Json | SchemaError {
    const serializedSchema = this.spec.serializeSchema();

    if (serializedSchema instanceof SchemaError) {
      return serializedSchema;
    }

    const schema: Json = {
      $type: '$record',
      param: serializedSchema,
    };

    return schema;
  }
}
