import { CodecError } from '../codec-error.js';
import { AnyCodec, Codec } from '../codec.js';
import { Context } from '../context.js';
import { isObject, Json } from '../json.js';
import { AnySchema, Schema } from '../schema.js';

export interface KeyCodec<T> extends Codec<T, AnySchema> {
  fromJsonProperty(key: string, ctx?: Context): string | number;
  toJsonProperty(key: string, ctx?: Context): string | number;
}

export class RecordSchema extends Schema<'record'> {
  constructor(
    public readonly key: AnySchema,
    public readonly value: AnySchema,
  ) {
    super('record');
  }
}

export class RecordCodec<
  Key extends KeyCodec<any>,
  Value extends AnyCodec,
> extends Codec<Record<Key['Type'], Value['Type']>, RecordSchema> {
  constructor(
    public readonly key: Key,
    public readonly value: Value,
  ) {
    super();
  }

  schema(): RecordSchema {
    return new RecordSchema(this.key.schema(), this.value.schema());
  }

  serialize(value: this['Type'], ctx?: Context): Json {
    ctx ??= new Context();
    let out: any | undefined;
    for (const key in value) {
      const field = value[key];
      const c = ctx.clone(key);
      const serializedKey = this.key.toJsonProperty(key, c);
      const serializedField = this.value.serialize(field, c);
      if (!out && (field !== serializedField || key !== serializedKey)) {
        out = { ...(value as object) };
        delete out[key];
      }
      if (out) {
        out[serializedKey as any] = serializedField;
      }
    }
    return out ?? value;
  }

  deserialize(json: Json, ctx?: Context): this['Type'] {
    if (!isObject(json)) {
      CodecError.throw(this, typeof json, ctx);
    }
    ctx ??= new Context();
    let out: any | undefined;
    for (const key in json) {
      const field = json[key]!;
      const c = ctx.clone(key);
      const deserializedKey = this.key.fromJsonProperty(key, c);
      const deserializedField = this.value.deserialize(field, c);
      if (!out && (field !== deserializedField || key !== deserializedKey)) {
        out = { ...json };
        delete out[key];
      }
      if (out) {
        out[deserializedKey] = deserializedField;
      }
    }
    return out ?? json;
  }
}
