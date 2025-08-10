import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';

export type ChoiceSpec = {
  [property: string]: Schema<any> | null;
};

export type InferChoiceType<S extends ChoiceSpec> = Simplify<
  {
    [K in keyof S]: {
      [P in K]: S[K] extends Schema<any> ? S[K]['Type'] : null;
    };
  }[keyof S]
>;

export type Simplify<T> = T extends any[] | Date
  ? T
  : { [K in keyof T]: T[K] } & {};

export class ChoiceSchema<S extends ChoiceSpec>
  implements Schema<InferChoiceType<S>>
{
  readonly [schemaSymbol] = undefined!;
  readonly Type: InferChoiceType<S> = undefined!;

  private constructor(readonly spec: S) {}

  static create<S extends ChoiceSpec>(
    spec: S,
    ctx?: Context,
  ): ChoiceSchema<S> | SchemaError {
    ctx ??= new Context();
    let atLeastOneVariant = false;
    for (const key in spec) {
      if (key.startsWith('$')) {
        const nextCtx = ctx.appendPath(key);
        return new SchemaError('reserved property', nextCtx);
      }
      atLeastOneVariant = true;
    }

    if (!atLeastOneVariant) {
      return new SchemaError('empty choice spec', ctx);
    }

    return new ChoiceSchema(spec);
  }

  serialize(input: InferChoiceType<S>, ctx: Context): Json | SchemaError {
    let error: SchemaError | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const nextCtx = ctx.appendPath(key);

      if (spec === null) {
        if (input !== undefined) {
          error = new SchemaError('expected unit value', nextCtx);
          continue;
        }

        return null;
      } else {
        const serializedValue = spec.serialize(input, nextCtx);

        if (serializedValue instanceof SchemaError) {
          error = serializedValue;
          continue;
        }

        return serializedValue;
      }
    }

    if (!error) {
      throw Error('empty choice spec');
    }

    return new SchemaError('no variant matched', ctx, error);
  }

  stringify(input: InferChoiceType<S>, ctx: Context): string | SchemaError {
    const serialized = this.serialize(input, ctx);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized, ctx);
  }

  parse(input: string, ctx: Context): InferChoiceType<S> | SchemaError {
    const json = parseJson(input, ctx);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json, ctx);
  }

  deserialize(input: unknown, ctx: Context): InferChoiceType<S> | SchemaError {
    let error: SchemaError | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const nextCtx = ctx.appendPath(key);

      if (spec === null) {
        if (input !== undefined) {
          error = new SchemaError('expected unit value', nextCtx);
          continue;
        }

        return { [key]: null } as InferChoiceType<S>;
      } else {
        const deserializedValue = spec.deserialize(input, nextCtx);

        if (deserializedValue instanceof SchemaError) {
          error = deserializedValue;
          continue;
        }

        return deserializedValue;
      }
    }

    if (!error) {
      throw Error('empty choice spec');
    }

    return new SchemaError('no variant matched', ctx, error);
  }

  serializeSchema(): Json | SchemaError {
    const schema: Json = {
      $type: '$choice',
    };

    for (const key in this.spec) {
      const spec = this.spec[key];

      if (spec === null) {
        schema[key] = null;
      } else {
        const serializedSchema = spec.serializeSchema();

        if (serializedSchema instanceof SchemaError) {
          return serializedSchema;
        }

        schema[key] = serializedSchema;
      }
    }

    return schema;
  }
}
