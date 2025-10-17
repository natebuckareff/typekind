import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isRegex, Json } from '../json.js';
import { NATURAL_NUMBER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import { KeyCodec } from './record.js';

/** @internal */
declare const u64Symbol: unique symbol;

export type U64 = bigint & { readonly [u64Symbol]: true };

export const u64 = (value: bigint): U64 => BigInt.asUintN(64, value) as U64;
export const MAX_U64 = u64(18_446_744_073_709_551_615n);

export class U64Schema extends Schema<'u64'> {}

export class U64Codec extends Codec<U64, U64Schema> implements KeyCodec<U64> {
  schema(): U64Schema {
    return new U64Schema('u64');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    return this.deserialize(key, ctx).toString();
  }

  serialize(value: U64, _?: Context): Json {
    return value.toString();
  }

  deserialize(json: Json, ctx?: Context): U64 {
    if (!isRegex(json, NATURAL_NUMBER_REGEX)) {
      CodecError.throw(this, typeof json, ctx);
    }
    const int = BigInt(json);
    if (int < 0n || int > MAX_U64) {
      throw new CodecError(`number is out-of-range for u64`, ctx);
    }
    return u64(int);
  }
}
