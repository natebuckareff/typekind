import { Context, Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { SchemaError } from '../schema-error.js';
import { ObjectSchema } from './object.js';

export type ChoiceSpec = {
  [property: string]: Schema<any> | null;
};

export type InferChoiceType<S extends ChoiceSpec> = Simplify<
  Simplify<{
    [K in keyof S]: S[K] extends ObjectSchema<any>
      ? { kind: K } & S[K]['Type']
      : S[K] extends Schema<any>
        ? { kind: K; value: S[K]['Type'] }
        : { kind: K };
  }>[keyof S]
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
    const spec = this.spec[input.kind];
    const nextCtx = ctx.appendPath(input.kind);

    if (spec === undefined) {
      return new SchemaError('unknown kind', nextCtx);
    }

    if (spec === null) {
      if (Object.keys(input).length !== 1) {
        return new SchemaError('expected unit variant', nextCtx);
      }
      return input as Json;
    }

    if (spec instanceof ObjectSchema) {
      return spec.serialize(input, nextCtx, 'kind');
    }

    if (!('value' in input)) {
      return new SchemaError('expected value', nextCtx);
    }

    const serializedValue = spec.serialize(input.value, nextCtx);

    if (serializedValue instanceof SchemaError) {
      return serializedValue;
    }

    return serializedValue !== input.value
      ? { kind: input.kind, value: serializedValue }
      : (input as Json);
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

  deserialize(input: Json, ctx: Context): InferChoiceType<S> | SchemaError {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return new SchemaError('non-object json', ctx);
    }

    if (!('kind' in input)) {
      return new SchemaError('missing kind', ctx);
    }

    if (typeof input.kind !== 'string') {
      return new SchemaError('kind must be a string', ctx);
    }

    const kind = input.kind;
    const spec = this.spec[kind];
    const nextCtx = ctx.appendPath(input.kind);

    if (spec === undefined) {
      return new SchemaError('unknown kind', nextCtx);
    }

    if (spec === null) {
      if (Object.keys(input).length !== 1) {
        return new SchemaError('expected unit variant', nextCtx);
      }
      return input as InferChoiceType<S>;
    }

    if (spec instanceof ObjectSchema) {
      return spec.deserialize(input, nextCtx, 'kind') as
        | InferChoiceType<S>
        | SchemaError;
    }

    if (!('value' in input)) {
      return new SchemaError('expected value', nextCtx);
    }

    const deserializedValue = spec.deserialize(input.value, nextCtx);

    if (deserializedValue instanceof SchemaError) {
      return deserializedValue;
    }

    return deserializedValue !== input.value
      ? ({ kind: input.kind, value: deserializedValue } as InferChoiceType<S>)
      : (input as InferChoiceType<S>);
  }

  serializeSchema(): Json | SchemaError {
    const schema: Json = {
      $type: '$choice',
    };

    for (const key in this.spec) {
      const spec = this.spec[key];

      if (spec === undefined) {
        return new SchemaError('unknown variant');
      } else if (spec === null) {
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
