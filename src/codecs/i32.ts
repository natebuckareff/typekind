import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isNumber, isRegex, Json } from '../json.js';
import { INTEGER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import { KeyCodec } from './record.js';

/** @internal */
declare const i32Symbol: unique symbol;

export type I32 = number & { readonly [i32Symbol]: true };

export const i32 = (value: number): I32 => (value | 0) as I32;
export const MIN_I32 = i32(-2_147_483_648);
export const MAX_I32 = i32(2_147_483_647);

export class I32Schema extends Schema<'i32'> {}

export class I32Codec extends Codec<I32, I32Schema> implements KeyCodec<I32> {
  schema(): I32Schema {
    return new I32Schema('i32');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    if (!isRegex(key, INTEGER_REGEX)) {
      CodecError.throw(this, typeof key, ctx);
    }
    return this.deserialize(Number(key), ctx);
  }

  serialize(value: I32, _?: Context): Json {
    return value;
  }

  deserialize(json: Json, ctx?: Context): I32 {
    if (!isNumber(json)) {
      CodecError.throw(this, typeof json, ctx);
    }
    if (json < MIN_I32 || json > MAX_I32) {
      throw new CodecError(`number is out-of-range for i32`, ctx);
    }
    return i32(json);
  }
}
