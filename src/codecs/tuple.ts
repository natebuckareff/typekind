import { type AnyCodec, Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import { Context } from '../context.js';
import { isArray, type Json } from '../json.js';
import { type AnySchema, Schema } from '../schema.js';

export class TupleSchema extends Schema<'tuple'> {
  constructor(public readonly elements: AnySchema[]) {
    super('tuple');
  }
}

export type InferTupleType<Elements extends AnyCodec[]> = {
  [K in keyof Elements]: Elements[K]['Type'];
};

export class TupleCodec<const Elements extends AnyCodec[]> extends Codec<
  InferTupleType<Elements>,
  TupleSchema
> {
  constructor(public readonly codecs: Elements) {
    super();
  }

  schema(): TupleSchema {
    return new TupleSchema(this.codecs.map(e => e.schema()));
  }

  override get(property: number | string): AnyCodec {
    const element = this.codecs[Number(property)];
    if (!element) {
      throw new Error(`tuple codec index out of range: "${property}"`);
    }
    return element;
  }

  override equals(other: AnyCodec): boolean {
    if (this === other) {
      return true;
    }

    if (!(other instanceof TupleCodec)) {
      return false;
    }

    if (this.codecs.length !== other.codecs.length) {
      return false;
    }

    return this.codecs.every((codec, i) =>
      // biome-ignore lint/style/noNonNullAssertion: safe with previous check
      codec.equals((other as TupleCodec<Elements>).codecs[i]!),
    );
  }

  override serializeImpl(value: this['Type'], ctx?: Context): Json {
    ctx ??= Context.create();

    if (value.length !== this.codecs.length) {
      throw new CodecError(`tuple length mismatch`, ctx);
    }

    let out: any[] | undefined;
    for (let i = 0; i < value.length; i++) {
      const element = value[i]!;
      const codec = this.codecs[i]!;
      const serialized = codec.serialize(element, ctx.clone(i));
      if (!out && element !== serialized) {
        out = [...value];
      }
      if (out) {
        out[i] = serialized;
      }
    }
    return out ?? value;
  }

  override deserializeImpl(json: Json, ctx?: Context): this['Type'] {
    ctx ??= Context.create();

    if (!isArray(json)) {
      CodecError.throw(this, typeof json, ctx);
    }

    if (json.length !== this.codecs.length) {
      throw new CodecError(`tuple length mismatch`, ctx);
    }

    let out: any[] | undefined;
    for (let i = 0; i < json.length; i++) {
      const c = ctx.clone(i);
      const element = json[i]!;
      const codec = this.codecs[i]!;
      const deserialized = codec.deserialize(element, c);
      if (!out && element !== deserialized) {
        out = [...json];
      }
      if (out) {
        out[i] = deserialized;
      }
    }
    return (out ?? json) as this['Type'];
  }
}
