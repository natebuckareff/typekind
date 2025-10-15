import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isNumber, Json } from '../json.js';
import { Schema } from '../schema.js';

/** @internal */
declare const u32Symbol: unique symbol;

export type U32 = number & { readonly [u32Symbol]: true };

export const u32 = (value: number): U32 => (value >>> 0) as U32;
export const MAX_U32 = 4_294_967_295;

export class U32Schema extends Schema<'u32', U32> {}

export class U32Codec extends Codec<U32, U32Schema> {
  schema(): U32Schema {
    return new U32Schema('u32');
  }

  serialize(value: U32, _?: Context): Json {
    return value;
  }

  deserialize(json: Json, ctx?: Context): U32 {
    if (!isNumber(json)) {
      CodecError.throw(this, json, ctx);
    }
    if (json < 0 || json > MAX_U32) {
      throw new CodecError(`number is out-of-range for u32`, ctx);
    }
    return json as U32;
  }
}
