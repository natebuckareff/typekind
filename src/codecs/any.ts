import { Codec } from '../codec.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';

export class AnyTypeSchema extends Schema<'any'> {}

export class AnyTypeCodec<T = any> extends Codec<T, AnyTypeSchema> {
  schema(): AnyTypeSchema {
    return new AnyTypeSchema('any');
  }

  override serializeImpl(value: T, _?: Context): Json {
    return value as Json;
  }

  override deserializeImpl(json: Json, _?: Context): T {
    return json as T;
  }
}
