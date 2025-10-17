import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isNumber, isRegex, Json } from '../json.js';
import { NATURAL_NUMBER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import { KeyCodec } from './record.js';

/** @internal */
declare const u32Symbol: unique symbol;

export type U32 = number & { readonly [u32Symbol]: true };

export const u32 = (value: number): U32 => (value >>> 0) as U32;
export const MAX_U32 = u32(9_007_199_254_740_991);

export class U32Schema extends Schema<'u32'> {}

export class U32Codec extends Codec<U32, U32Schema> implements KeyCodec<U32> {
  schema(): U32Schema {
    return new U32Schema('u32');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    if (!isRegex(key, NATURAL_NUMBER_REGEX)) {
      CodecError.throw(this, typeof key, ctx);
    }
    return key;
  }

  serialize(value: U32, _?: Context): Json {
    return value;
  }

  deserialize(json: Json, ctx?: Context): U32 {
    if (!isNumber(json)) {
      CodecError.throw(this, typeof json, ctx);
    }
    if (json < 0 || json > MAX_U32) {
      throw new CodecError(`number is out-of-range for u32`, ctx);
    }
    return u32(json);
  }
}
