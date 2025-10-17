import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isNumber, isRegex, Json } from '../json.js';
import { INTEGER_REGEX } from '../regex.js';
import { Schema } from '../schema.js';
import { KeyCodec } from './record.js';

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
      CodecError.throw(this, key, ctx);
    }
    return this.deserialize(Number(key), ctx).getTime();
  }

  serialize(value: Date, _?: Context): Json {
    return value.getTime();
  }

  deserialize(json: Json, ctx?: Context): Date {
    if (!isNumber(json)) {
      CodecError.throw(this, json, ctx);
    }
    return new Date(json);
  }
}
