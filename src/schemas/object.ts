import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';
import { Simplify } from './choice.js';
import { OptionSchema } from './option.js';

export type ObjectSpec = {
  [property: string]: Schema<any>;
};

export type InferObjectType<S extends ObjectSpec> = Simplify<
  {
    [K in keyof S as S[K] extends OptionSchema<any>
      ? K
      : never]?: S[K] extends OptionSchema<any>
      ? S[K]['Type'] | undefined
      : never;
  } & {
    [K in keyof S as S[K] extends OptionSchema<any>
      ? never
      : K]: S[K] extends Schema<any> ? S[K]['Type'] : never;
  }
>;

export class ObjectSchema<S extends ObjectSpec>
  implements Schema<InferObjectType<S>>
{
  readonly [schemaSymbol] = undefined!;
  readonly Type: InferObjectType<S> = undefined!;

  private constructor(readonly spec: S) {}

  static create<S extends ObjectSpec>(
    spec: S,
    ctx?: Context,
  ): ObjectSchema<S> | SchemaError {
    ctx ??= new Context();
    for (const key in spec) {
      if (key.startsWith('$')) {
        const nextCtx = ctx.appendPath(key);
        return new SchemaError('reserved property', nextCtx);
      }
    }
    return new ObjectSchema(spec);
  }

  serialize(input: InferObjectType<S>, ctx: Context): Json | SchemaError {
    let out: { [key: string]: Json } | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const hasProperty = key in input;
      const isOptional = spec instanceof OptionSchema;

      if (!hasProperty && !isOptional) {
        const nextCtx = ctx.appendPath(key);
        return new SchemaError('missing required property', nextCtx);
      }
    }

    for (const key in input) {
      const value = input[key];
      const spec = this.spec[key];
      const nextCtx = ctx.appendPath(key);

      if (spec === undefined) {
        return new SchemaError('unknown property', nextCtx);
      }

      const serializedValue = spec.serialize(value, nextCtx);

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

  stringify(value: InferObjectType<S>, ctx: Context): string | SchemaError {
    const serialized = this.serialize(value, ctx);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized, ctx);
  }

  parse(input: string, ctx: Context): InferObjectType<S> | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: Json, ctx: Context): InferObjectType<S> | SchemaError {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return new SchemaError('non-object json', ctx);
    }

    let out: { [key: string]: unknown } | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const hasProperty = key in input;
      const isOptional = spec instanceof OptionSchema;

      if (!hasProperty && !isOptional) {
        const nextCtx = ctx.appendPath(key);
        return new SchemaError('missing required property', nextCtx);
      }
    }

    for (const key in input) {
      const value = input[key];
      const spec = this.spec[key];
      const nextCtx = ctx.appendPath(key);

      if (spec === undefined) {
        return new SchemaError('unexpected property', nextCtx);
      }

      const deserializedValue = spec.deserialize(value, nextCtx);

      if (deserializedValue instanceof SchemaError) {
        return deserializedValue;
      }

      if (value !== deserializedValue) {
        out ??= { ...(input as { [key: string]: Json }) };
        out[key] = deserializedValue;
      }
    }

    return (out ?? (input as InferObjectType<S>)) as InferObjectType<S>;
  }

  serializeSchema(): Json | SchemaError {
    const schema: Json = {};

    for (const key in this.spec) {
      const spec = this.spec[key];
      const serializedSchema = spec.serializeSchema();

      if (serializedSchema instanceof SchemaError) {
        return serializedSchema;
      }

      schema[key] = serializedSchema;
    }

    return schema;
  }
}
