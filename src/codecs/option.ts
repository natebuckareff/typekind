import { type AnyCodec, Codec } from '../codec.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { type AnySchema, Schema } from '../schema.js';

export class OptionSchema extends Schema<'option'> {
  constructor(public readonly of: AnySchema) {
    super('option');
  }
}

export class OptionCodec<T extends AnyCodec> extends Codec<
  T['Type'] | undefined,
  OptionSchema
> {
  public readonly codec: T;

  constructor(codec: T) {
    super();
    while (codec instanceof OptionCodec) {
      codec = codec.codec;
    }
    this.codec = codec;
  }

  override get(property: number | string): AnyCodec {
    let sub: AnyCodec = this.codec.get(property);
    while (sub instanceof OptionCodec) {
      sub = sub.codec;
    }
    return new OptionCodec(sub);
  }

  schema(): OptionSchema {
    return new OptionSchema(this.codec.schema());
  }

  override serializeImpl(value: T['Type'] | undefined, ctx?: Context): Json {
    if (value === undefined) {
      return null;
    } else {
      return this.codec.serialize(value, ctx);
    }
  }

  override deserializeImpl(json: Json, ctx?: Context): T['Type'] {
    if (json === null) {
      return undefined;
    } else {
      return this.codec.deserialize(json, ctx);
    }
  }
}
