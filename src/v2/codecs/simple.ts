import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { Json } from '../json.js';
import { Schema } from '../schema.js';

function createSchema<const Name extends string>(type: Name): Schema<Name> {
  return { type } as Schema<Name>;
}

function createCodec<const Name extends string, Type>(
  name: Name,
  check: (value: unknown) => value is Type,
) {
  return class PrimitiveCodec extends Codec<Type, Schema<Name>> {
    schema(): Schema<Name> {
      return createSchema(name);
    }

    serialize(value: Type, _?: Context): Json {
      return value as Json;
    }

    deserialize(json: Json, ctx?: Context): Type {
      if (!check(json)) {
        CodecError.throw(this, json, ctx);
      }
      return json;
    }
  };
}

export const NullCodec = createCodec<'null', null>(
  'null',
  value => value === null,
);

export const BooleanCodec = createCodec<'boolean', boolean>(
  'boolean',
  value => typeof value === 'boolean',
);

export const StringCodec = createCodec<'string', string>(
  'string',
  value => typeof value === 'string',
);

export const NumberCodec = createCodec<'number', number>(
  'number',
  value => typeof value === 'number',
);
