import { type AnyCodec, Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import { isObject, isString, type Json, type JsonObject } from '../json.js';
import { type AnySchema, Schema } from '../schema.js';
import type { Simplify } from '../util.js';
import { ObjectCodec } from './object.js';

export type ChoiceSpec = {
  [variant: string]: AnyCodec | null;
};

export type InferChoiceType<Spec extends ChoiceSpec> = Simplify<
  {
    [K in keyof Spec]: Spec[K] extends ObjectCodec<any>
      ? { kind: K } & Spec[K]['Type']
      : Spec[K] extends AnyCodec
        ? { kind: K; value: Spec[K]['Type'] }
        : { kind: K };
  }[keyof Spec]
>;

export class ChoiceSchema extends Schema<'choice'> {
  constructor(public readonly variants: Record<string, AnySchema | null>) {
    super('choice');
  }
}

export class ChoiceCodec<Spec extends ChoiceSpec> extends Codec<
  InferChoiceType<Spec>,
  ChoiceSchema
> {
  constructor(public readonly spec: Spec) {
    super();
  }

  schema(): ChoiceSchema {
    const schema: Record<string, AnySchema | null> = {};
    for (const [key, codec] of Object.entries(this.spec)) {
      schema[key] = codec === null ? null : codec.schema();
    }
    return new ChoiceSchema(schema);
  }

  override equals(other: AnyCodec): boolean {
    if (!(other instanceof ChoiceCodec)) {
      return false;
    }

    const keys = Object.keys(this.spec);
    const otherKeys = Object.keys(other.spec);

    if (keys.length !== otherKeys.length) {
      return false;
    }

    for (const key of keys) {
      const codec = this.spec[key];
      const otherCodec = (other as ChoiceCodec<Spec>).spec[key];

      if (codec === null || otherCodec === null) {
        if (codec !== otherCodec) {
          return false;
        }
      } else {
        if (!codec || !otherCodec || !codec.equals(otherCodec)) {
          return false;
        }
      }
    }

    return true;
  }

  override serializeImpl(input: InferChoiceType<Spec>, ctx?: Context): Json {
    const kind = input.kind as string;
    const spec: AnyCodec | undefined | null = this.spec[kind];

    if (spec === undefined) {
      throw new CodecError(`unknown kind: ${kind}`, ctx);
    } else if (spec === null) {
      return input as Json;
    } else if (spec instanceof ObjectCodec) {
      const { kind: _, ...rest } = input;
      const serialized = spec.serialize(rest, ctx) as JsonObject;
      return { kind, ...serialized };
    } else {
      const { value } = input;
      const serialized = spec.serialize(value, ctx);
      return value === serialized
        ? (input as Json)
        : ({ kind, value: serialized } as Json);
    }
  }

  override deserializeImpl(json: Json, ctx?: Context): InferChoiceType<Spec> {
    if (!isObject(json)) {
      CodecError.throw(this, typeof json, ctx);
    }

    const kind = json.kind;

    if (kind === undefined) {
      throw new CodecError('missing "kind" property', ctx);
    } else if (!isString(kind)) {
      CodecError.throw(this, typeof kind, ctx);
    }

    const spec = this.spec[kind];

    if (spec === undefined) {
      throw new CodecError(`unknown variant kind: ${kind}`);
    } else if (spec === null) {
      const keys = Object.keys(json);
      if (keys.length !== 1) {
        const s = keys.length > 1 ? 's' : '';
        throw new CodecError(
          `expected unit variant, got key${s}: ${keys.map(k => JSON.stringify(k)).join(', ')}`,
          ctx,
        );
      }
      return json as InferChoiceType<Spec>;
    } else if (spec instanceof ObjectCodec) {
      const { kind: _, ...rest } = json;
      const deserialized = spec.deserialize(rest, ctx);
      return { kind, ...deserialized } as any;
    } else {
      const { kind: _, value, ...rest } = json;
      if (value === undefined) {
        throw new CodecError('missing "value" property', ctx);
      }
      const keys = Object.keys(rest);
      if (keys.length > 0) {
        const s = keys.length > 1 ? 's' : '';
        throw new CodecError(
          `expected single property "value", got key${s}: ${keys.map(k => JSON.stringify(k)).join(', ')}`,
          ctx,
        );
      }
      const deserialized = spec.deserialize(value, ctx);
      return value === deserialized
        ? (json as InferChoiceType<Spec>)
        : ({ kind, value: deserialized } as InferChoiceType<Spec>);
    }
  }
}
