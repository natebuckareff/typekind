import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';

export class UndefinedSchema extends Schema<'undefined'> {}

export class UndefinedCodec extends Codec<undefined, UndefinedSchema> {
  schema(): UndefinedSchema {
    return new UndefinedSchema('undefined');
  }

  override serializeImpl(_value: this['Type'], _?: Context): Json {
    return null;
  }

  override deserializeImpl(json: Json, ctx?: Context): this['Type'] {
    if (json !== null) {
      CodecError.throw(this, typeof json, ctx);
    }
    return;
  }
}
