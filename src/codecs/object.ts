import { type AnyCodec, Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import { Context } from '../context.js';
import { isObject, type Json } from '../json.js';
import { type AnySchema, Schema } from '../schema.js';
import type { Simplify } from '../util.js';
import { OptionCodec } from './option.js';

export type ObjectSpec = {
  [key: string]: AnyCodec;
};

export type InferObjectType<Spec extends ObjectSpec> = Simplify<
  {
    [K in keyof Spec as Spec[K] extends OptionCodec<any>
      ? never
      : K]: Spec[K]['Type'];
  } & {
    [K in keyof Spec as Spec[K] extends OptionCodec<any>
      ? K
      : never]?: Spec[K]['Type'];
  }
>;

export class ObjectSchema extends Schema<'object'> {
  constructor(public readonly properties: Record<string, AnySchema>) {
    super('object');
  }
}

export class ObjectCodec<Spec extends ObjectSpec> extends Codec<
  InferObjectType<Spec>,
  ObjectSchema
> {
  constructor(public readonly spec: Spec) {
    super();
  }

  schema(): ObjectSchema {
    const schema: Record<string, AnySchema> = {};
    for (const [key, codec] of Object.entries(this.spec)) {
      schema[key] = codec.schema();
    }
    return new ObjectSchema(schema);
  }

  override get(property: number | string): AnyCodec {
    if (typeof property !== 'string') {
      throw Error(`expected string property but got "${typeof property}"`);
    }

    const codec = this.spec[property];

    if (!codec) {
      throw Error(`unknown object codec property: "${property}"`);
    }

    return codec;
  }

  override equals(other: AnyCodec): boolean {
    if (!(other instanceof ObjectCodec)) {
      return false;
    }

    const keys = Object.keys(this.spec);
    const otherKeys = Object.keys(other.spec);

    if (keys.length !== otherKeys.length) {
      return false;
    }

    for (const key of keys) {
      const codec = this.spec[key];
      const otherCodec = other.spec[key];
      if (!codec || !otherCodec || !codec.equals(otherCodec)) {
        return false;
      }
    }

    return true;
  }

  override serializeImpl(input: this['Type'], ctx?: Context): Json {
    ctx ??= Context.create();
    let out: any | undefined;

    for (const [key, codec] of Object.entries(this.spec)) {
      if (!Object.hasOwn(input, key) && !(codec instanceof OptionCodec)) {
        throw new CodecError(
          `missing property: ${JSON.stringify(key)}`,
          ctx.clone(key).pop(),
        );
      }
    }

    for (const [key, value] of Object.entries(input)) {
      const codec = this.spec[key];
      if (!codec) {
        throw new CodecError(
          `unexpected property: ${JSON.stringify(key)}`,
          ctx.clone(key).pop(),
        );
      }
      const serialized = codec.serialize(value, ctx.clone(key));
      if (!out && value !== serialized) {
        out = { ...(input as object) };
      }
      if (out) {
        out[key] = serialized;
      }
    }
    return out ?? input;
  }

  override deserializeImpl(json: Json, ctx?: Context): this['Type'] {
    if (!isObject(json)) {
      CodecError.throw(this, typeof json, ctx);
    }

    ctx ??= Context.create();
    let out: any | undefined;

    for (const key of Object.keys(this.spec)) {
      if (!(key in json)) {
        throw new CodecError(
          `missing property: ${JSON.stringify(key)}`,
          ctx.clone(key).pop(),
        );
      }
    }

    for (const key in json) {
      const value = json[key]!;
      const codec = this.spec[key];
      if (!codec) {
        throw new CodecError(
          `unexpected property: ${JSON.stringify(key)}`,
          ctx.clone(key).pop(),
        );
      }
      const serialized = codec.deserialize(value, ctx.clone(key));
      if (!out && value !== serialized) {
        out = { ...(json as object) };
      }
      if (out) {
        out[key] = serialized;
      }
    }
    return out ?? json;
  }
}
