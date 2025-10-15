import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { isNumber, Json } from '../json.js';
import { Schema } from '../schema.js';

export class DateSchema extends Schema<'date', Date> {}

export class DateCodec extends Codec<Date, DateSchema> {
  schema(): DateSchema {
    return new DateSchema('date');
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
