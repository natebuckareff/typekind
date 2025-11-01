import { type AnyCodec, Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import { Context } from '../context.js';
import { isArray, type Json } from '../json.js';
import { type AnySchema, Schema } from '../schema.js';
import { OptionCodec } from './option.js';

export class ArraySchema extends Schema<'array'> {
  constructor(public readonly elements: AnySchema) {
    super('array');
  }
}

export class ArrayCodec<T extends AnyCodec> extends Codec<
  T['Type'][],
  ArraySchema
> {
  constructor(public readonly codec: T) {
    super();
  }

  schema(): ArraySchema {
    return new ArraySchema(this.codec.schema());
  }

  override get(_: number | string): AnyCodec {
    return new OptionCodec(this.codec);
  }

  override equals(other: AnyCodec): boolean {
    return other instanceof ArrayCodec && this.codec.equals(other.codec);
  }

  override serializeImpl(value: this['Type'], ctx?: Context): Json[] {
    ctx ??= Context.create();
    let out: any[] | undefined;
    for (let i = 0; i < value.length; i++) {
      const element = value[i]!;
      const serialized = this.codec.serialize(element, ctx.clone(i));
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
    let out: any[] | undefined;
    for (let i = 0; i < json.length; i++) {
      const c = ctx.clone(i);
      const element = json[i]!;
      const deserialized = this.codec.deserialize(element, c);
      if (!out && element !== deserialized) {
        out = [...json];
      }
      if (out) {
        out[i] = deserialized;
      }
    }
    return out ?? json;
  }
}
