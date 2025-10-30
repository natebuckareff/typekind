import { Codec } from '../codec.js';
import { CodecError } from '../codec-error.js';
import type { Context } from '../context.js';
import type { Json } from '../json.js';
import { Schema } from '../schema.js';

export class InstanceSchema extends Schema<'instance'> {
  constructor(public readonly name: string) {
    super('instance');
  }
}

export type Class<T, Args extends any[]> = new (...args: Args) => T;

export class InstanceCodec<Cls extends Class<any, any[]>> extends Codec<
  InstanceType<Cls>,
  InstanceSchema
> {
  constructor(public readonly cls: Cls) {
    super();
  }

  schema(): InstanceSchema {
    return new InstanceSchema(this.cls.name);
  }

  override serializeImpl(value: this['Type'], _?: Context): Json {
    if ('toJSON' in value && typeof value.toJSON === 'function') {
      return value.toJSON();
    }

    throw Error(`class serialization not supported for "${this.cls.name}"`);
  }

  override deserializeImpl(json: Json, ctx?: Context): this['Type'] {
    if ('fromJSON' in this.cls && typeof this.cls.fromJSON === 'function') {
      const deserialized = this.cls.fromJSON(json);

      if (deserialized instanceof this.cls) {
        return deserialized;
      } else {
        CodecError.throw(this.cls.name, deserialized.constructor.name, ctx);
      }
    }

    throw Error(`class deserialization not supported for "${this.cls.name}"`);
  }
}
