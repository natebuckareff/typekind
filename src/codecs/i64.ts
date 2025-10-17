import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isRegex, Json } from '../json.js';
import { INTEGER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import { KeyCodec } from './record.js';

/** @internal */
declare const i64Symbol: unique symbol;

export type I64 = bigint & { readonly [i64Symbol]: true };

export const i64 = (value: bigint): I64 => BigInt.asIntN(64, value) as I64;
export const MIN_I64 = i64(-9_223_372_036_854_775_808n);
export const MAX_I64 = i64(9_223_372_036_854_775_807n);

export class I64Schema extends Schema<'i64'> {}

export class I64Codec extends Codec<I64, I64Schema> implements KeyCodec<I64> {
  schema(): I64Schema {
    return new I64Schema('i64');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    return this.deserialize(key, ctx).toString();
  }

  serialize(value: I64, _?: Context): Json {
    return value.toString();
  }

  deserialize(json: Json, ctx?: Context): I64 {
    if (!isRegex(json, INTEGER_REGEX)) {
      CodecError.throw(this, typeof json, ctx);
    }
    const int = BigInt(json);
    if (int < MIN_I64 || int > MAX_I64) {
      throw new CodecError(`number is out-of-range for i64`, ctx);
    }
    return i64(int);
  }
}
