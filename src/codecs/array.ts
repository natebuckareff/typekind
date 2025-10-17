import { CodecError } from '../codec-error.js';
import { AnyCodec, Codec } from '../codec.js';
import { Context } from '../context.js';
import { isArray, Json } from '../json.js';
import { AnySchema, Schema } from '../schema.js';

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

  serialize(value: this['Type'], ctx?: Context): Json[] {
    ctx ??= new Context();
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

  deserialize(json: Json, ctx?: Context): this['Type'] {
    ctx ??= new Context();
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
