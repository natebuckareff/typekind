import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';
import type { KeyCodec } from './record.js';

const FLOAT64_REGEX =
  /^(?:NaN|-?Infinity|-?(?:0|[1-9]\d*)(?:\.\d+)?|-?\d(?:\.\d+)?e[+-]?\d+)$/;

export class NumberSchema extends Schema<'number'> {}

export class NumberCodec
  extends Codec<number, NumberSchema>
  implements KeyCodec<number>
{
  schema(): NumberSchema {
    return new NumberSchema('number');
  }

  toJsonProperty(key: string, _?: Context): string | number {
    return key;
  }

  fromJsonProperty(key: string, _?: Context): string | number {
    if (!FLOAT64_REGEX.test(key)) {
      CodecError.throw('number', key);
    }
    return key;
  }

  override serializeImpl(value: number, _?: Context): Json {
    return value;
  }

  override deserializeImpl(json: Json, ctx?: Context): number {
    if (typeof json !== 'number') {
      CodecError.throw(this, typeof json, ctx);
    }
    return json;
  }
}
