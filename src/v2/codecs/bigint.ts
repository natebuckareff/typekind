import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isRegex, Json } from '../json.js';
import { Schema } from '../schema.js';

export class BigIntSchema extends Schema<'bigint'> {}

export class BigIntCodec extends Codec<bigint, BigIntSchema> {
  schema(): BigIntSchema {
    return new BigIntSchema('bigint');
  }

  serialize(value: bigint, _?: Context): Json {
    return value.toString();
  }

  deserialize(json: Json, ctx?: Context): bigint {
    if (!isRegex(json, /^[0-9]+$/)) {
      CodecError.throw(this, json, ctx);
    }
    return BigInt(json);
  }
}
