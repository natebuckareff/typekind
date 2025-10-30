import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';
import type { KeyCodec } from './record.js';

export class NullSchema extends Schema<'null'> {}

export class NullCodec
  extends Codec<null, NullSchema>
  implements KeyCodec<null>
{
  schema(): Schema<'null'> {
    return new NullSchema('null');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    if (key !== 'null') {
      CodecError.throw('null', key, ctx);
    }
    return key;
  }

  override serializeImpl(value: null, _?: Context): Json {
    return value;
  }

  override deserializeImpl(json: Json, ctx?: Context): null {
    if (json !== null) {
      CodecError.throw(this, typeof json, ctx);
    }
    return json;
  }
}
