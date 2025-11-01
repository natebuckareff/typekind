import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';
import type { KeyCodec } from './record.js';

export class StringSchema extends Schema<'string'> {}

export class StringCodec
  extends Codec<string, StringSchema>
  implements KeyCodec<string>
{
  schema(): StringSchema {
    return new StringSchema('string');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  override serializeImpl(value: string, _?: Context): Json {
    return value;
  }

  override deserializeImpl(json: Json, ctx?: Context): string {
    if (typeof json !== 'string') {
      CodecError.throw(this, typeof json, ctx);
    }
    return json;
  }
}
