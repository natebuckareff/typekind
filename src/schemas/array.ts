import { Context, Schema, schemaSymbol } from '../core.js';
import { SchemaError } from '../schema-error.js';
import { Json, parseJson, stringifyJson } from '../json.js';

export class ArraySchema<S extends Schema<any>> implements Schema<S['Type'][]> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: S['Type'][] = undefined!;

  constructor(readonly spec: S) {}

  serialize(input: S['Type'][], ctx: Context): Json | SchemaError {
    let out: Json[] | undefined;

    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      const nextCtx = ctx.appendPath(i);
      const serializedValue = this.spec.serialize(value, nextCtx);

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

  stringify(value: S['Type'][], ctx: Context): string | SchemaError {
    const serialized = this.serialize(value, ctx);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized, ctx);
  }

  parse(input: string, ctx: Context): S['Type'][] | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: Json, ctx: Context): S['Type'][] | SchemaError {
    if (!Array.isArray(input)) {
      return new SchemaError('non-array json', ctx);
    }

    let out: S['Type'][] | undefined;

    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      const nextCtx = ctx.appendPath(i);
      const deserializedValue = this.spec.deserialize(value, nextCtx);

      if (deserializedValue instanceof SchemaError) {
        return deserializedValue;
      }

      if (value !== deserializedValue) {
        out ??= [...input];
        out[i] = deserializedValue;
      }
    }

    return out ?? input;
  }

  serializeSchema(): Json | SchemaError {
    const serializedSchema = this.spec.serializeSchema();

    if (serializedSchema instanceof SchemaError) {
      return serializedSchema;
    }

    return [serializedSchema];
  }
}
