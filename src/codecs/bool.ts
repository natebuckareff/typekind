import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';
import type { KeyCodec } from './record.js';

export class BoolSchema extends Schema<'bool'> {}

export class BoolCodec
  extends Codec<boolean, BoolSchema>
  implements KeyCodec<boolean>
{
  schema(): BoolSchema {
    return new BoolSchema('bool');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    if (key !== 'true' && key !== 'false') {
      CodecError.throw(['true', 'false'], key, ctx);
    }
    return key;
  }

  override serializeImpl(value: boolean, _?: Context): Json {
    return value;
  }

  override deserializeImpl(json: Json, ctx?: Context): boolean {
    if (typeof json !== 'boolean') {
      CodecError.throw(this, typeof json, ctx);
    }
    return json;
  }
}
