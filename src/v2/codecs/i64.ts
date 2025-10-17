import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isRegex, Json } from '../json.js';
import { NATURAL_NUMBER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';

/** @internal */
declare const i64Symbol: unique symbol;

export type I64 = bigint & { readonly [i64Symbol]: true };

export const i64 = (value: bigint): I64 => BigInt.asIntN(64, value) as I64;
export const MIN_I64 = i64(-9_223_372_036_854_775_808n);
export const MAX_I64 = i64(9_223_372_036_854_775_807n);

export class I64Schema extends Schema<'i64'> {}

export class I64Codec extends Codec<I64, I64Schema> {
  schema(): I64Schema {
    return new I64Schema('i64');
  }

  serialize(value: I64, _?: Context): Json {
    return value.toString();
  }

  deserialize(json: Json, ctx?: Context): I64 {
    if (!isRegex(json, NATURAL_NUMBER_REGEX)) {
      CodecError.throw(this, json, ctx);
    }
    const int = BigInt(json);
    if (int < MIN_I64 || int > MAX_I64) {
      throw new CodecError(`number is out-of-range for i64`, ctx);
    }
    return i64(int);
  }
}
