import { type AnyCodec, Codec } from '../codec.js';
import type { Context, Json } from '../index.js';
import { type AnySchema, Schema } from '../schema.js';

export class FunctionSchema extends Schema<'function'> {
  constructor(
    public readonly params: AnySchema[],
    public readonly ret: AnySchema,
  ) {
    super('function');
  }
}

export type InferFunctionType<
  Params extends AnyCodec[],
  Return extends AnyCodec,
> = (...args: { [K in keyof Params]: Params[K]['Type'] }) => Return['Type'];

export class FunctionCodec<
  Params extends AnyCodec[],
  Return extends AnyCodec,
> extends Codec<InferFunctionType<Params, Return>, FunctionSchema> {
  constructor(
    public readonly params: Params,
    public readonly ret: Return,
  ) {
    super();
  }

  schema(): FunctionSchema {
    return new FunctionSchema(
      this.params.map(p => p.schema()),
      this.ret.schema(),
    );
  }

  serializeImpl(_value: this['Type'], _?: Context): Json {
    throw Error('function serialization not implemented');
  }

  deserializeImpl(_json: Json, _?: Context): this['Type'] {
    throw Error('function deserialization not implemented');
  }
}
