import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import { isNumber, isRegex, type Json } from '../json.js';
import { INTEGER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import type { KeyCodec } from './record.js';

export class DateSchema extends Schema<'date'> {}

export class DateCodec
  extends Codec<Date, DateSchema>
  implements KeyCodec<Date>
{
  schema(): DateSchema {
    return new DateSchema('date');
  }

  toJsonProperty(key: string, _?: Context): string {
    return key;
  }

  fromJsonProperty(key: string, ctx?: Context): string | number {
    if (!isRegex(key, INTEGER_REGEX)) {
      CodecError.throw(this, typeof key, ctx);
    }
    return this.deserializeImpl(Number(key), ctx).getTime();
  }

  override serializeImpl(value: Date, _?: Context): Json {
    return value.getTime();
  }

  override deserializeImpl(json: Json, ctx?: Context): Date {
    if (!isNumber(json)) {
      CodecError.throw(this, typeof json, ctx);
    }
    return new Date(json);
  }
}
