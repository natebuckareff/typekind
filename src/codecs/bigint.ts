import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import { isRegex, type Json } from '../json.js';
import { INTEGER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import type { KeyCodec } from './record.js';

export class BigIntSchema extends Schema<'bigint'> {}

export class BigIntCodec
  extends Codec<bigint, BigIntSchema>
  implements KeyCodec<bigint>
{
  schema(): BigIntSchema {
    return new BigIntSchema('bigint');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    return this.deserialize(key, ctx).toString();
  }

  serialize(value: bigint, _?: Context): Json {
    return value.toString();
  }

  deserialize(json: Json, ctx?: Context): bigint {
    if (!isRegex(json, INTEGER_REGEX)) {
      CodecError.throw(this, typeof json, ctx);
    }
    return BigInt(json);
  }
}
