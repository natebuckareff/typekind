import { AnyCodec, Codec } from '../codec.js';
import { Context } from '../context.js';
import { Json } from '../json.js';
import { AnySchema, Schema } from '../schema.js';

export class OptionSchema<S extends AnySchema> extends Schema<
  'option',
  S['Type'] | undefined
> {
  constructor(public readonly of: S) {
    super('option');
  }
}

export class OptionCodec<T extends AnyCodec> extends Codec<
  T['Type'] | undefined,
  OptionSchema<T['Schema']>
> {
  constructor(public readonly codec: T) {
    super();
  }

  schema(): OptionSchema<T['Schema']> {
    return new OptionSchema<T['Schema']>(this.codec.schema());
  }

  serialize(value: T['Type'] | undefined, ctx?: Context): Json {
    if (value === undefined) {
      return null;
    } else {
      return this.codec.serialize(value, ctx);
    }
  }

  deserialize(json: Json, ctx?: Context): T['Type'] {
    if (json === null) {
      return undefined;
    } else {
      return this.codec.deserialize(json, ctx);
    }
  }
}
