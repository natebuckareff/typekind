import { CodecError } from '../codec-error.js';
import { Codec } from '../codec.js';
import { Context } from '../context.js';
import { Json } from '../json.js';
import { Schema } from '../schema.js';
import { KeyCodec } from './record.js';

function createSchema<const Name extends string>(type: Name): Schema<Name> {
  return { type } as Schema<Name>;
}

function createCodec<const Name extends string, Type>(
  name: Name,
  check: (value: unknown) => value is Type,
  fromString: (value: string) => Type,
) {
  return class PrimitiveCodec
    extends Codec<Type, Schema<Name>>
    implements KeyCodec<Type>
  {
    schema(): Schema<Name> {
      return createSchema(name);
    }

    toJsonProperty(key: string, ctx?: Context): string | number {
      return key;
    }

    fromJsonProperty(key: string, ctx?: Context): string | number {
      return fromString(key) + '';
    }

    serialize(value: Type, _?: Context): Json {
      return value as Json;
    }

    deserialize(json: Json, ctx?: Context): Type {
      if (!check(json)) {
        CodecError.throw(this, typeof json, ctx);
      }
      return json;
    }
  };
}

export const NullCodec = createCodec<'null', null>(
  'null',
  value => value === null,
  str => {
    if (str === 'null') {
      return null;
    }
    CodecError.throw('null', str);
  },
);

export const BoolCodec = createCodec<'boolean', boolean>(
  'boolean',
  value => typeof value === 'boolean',
  str => {
    if (str === 'true') {
      return true;
    } else if (str === 'false') {
      return false;
    } else {
      CodecError.throw(['true', 'false'], str);
    }
  },
);

export const StringCodec = createCodec<'string', string>(
  'string',
  value => typeof value === 'string',
  str => str,
);

const FLOAT64_REGEX =
  /^(?:NaN|-?Infinity|-?(?:0|[1-9]\d*)(?:\.\d+)?|-?\d(?:\.\d+)?e[+\-]?\d+)$/;

export const NumberCodec = createCodec<'number', number>(
  'number',
  value => typeof value === 'number',
  str => {
    if (FLOAT64_REGEX.test(str)) {
      return Number(str);
    }
    CodecError.throw('number', str);
  },
);
