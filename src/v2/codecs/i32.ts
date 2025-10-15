import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isNumber, Json } from '../json.js';
import { Schema } from '../schema.js';

/** @internal */
declare const i32Symbol: unique symbol;

export type I32 = number & { readonly [i32Symbol]: true };

export const i32 = (value: number): I32 => (value | 0) as I32;
export const MIN_I32 = -2_147_483_648;
export const MAX_I32 = 2_147_483_647;

export class I32Schema extends Schema<'i32', I32> {}

export class I32Codec extends Codec<I32, I32Schema> {
  schema(): I32Schema {
    return new I32Schema('i32');
  }

  serialize(value: I32, _?: Context): Json {
    return value;
  }

  deserialize(json: Json, ctx?: Context): I32 {
    if (!isNumber(json)) {
      CodecError.throw(this, json, ctx);
    }
    if (json < MIN_I32 || json > MAX_I32) {
      throw new CodecError(`number is out-of-range for i32`, ctx);
    }
    return json as I32;
  }
}
