import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';

export class VoidSchema extends Schema<'void'> {}

export class VoidCodec extends Codec<void, VoidSchema> {
  schema(): VoidSchema {
    return new VoidSchema('void');
  }

  serialize(_value: void, _?: Context): Json {
    return null;
  }

  deserialize(json: Json, ctx?: Context): void {
    if (json !== undefined) {
      CodecError.throw(this, typeof json, ctx);
    }
  }
}
