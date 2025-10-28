import { createBuilder } from './builder.js';
import type { AnyCodec } from './codec.js';
import { ArrayCodec } from './codecs/array.js';
import { BigIntCodec } from './codecs/bigint.js';
import { BoolCodec } from './codecs/bool.js';
import { ChoiceCodec, type ChoiceSpec } from './codecs/choice.js';
import { DateCodec } from './codecs/date.js';
import { I32Codec } from './codecs/i32.js';
import { I64Codec } from './codecs/i64.js';
import { NullCodec } from './codecs/null.js';
import { NumberCodec } from './codecs/number.js';
import { ObjectCodec, type ObjectSpec } from './codecs/object.js';
import { OptionCodec } from './codecs/option.js';
import { type KeyCodec, RecordCodec } from './codecs/record.js';
import { StringCodec } from './codecs/string.js';
import { TupleCodec } from './codecs/tuple.js';
import { U32Codec } from './codecs/u32.js';
import { U64Codec } from './codecs/u64.js';

export const i32 = createBuilder(() => new I32Codec());
export const i64 = createBuilder(() => new I64Codec());
export const u32 = createBuilder(() => new U32Codec());
export const u64 = createBuilder(() => new U64Codec());

const _null = createBuilder(() => new NullCodec());
const _bool = createBuilder(() => new BoolCodec());
const _number = createBuilder(() => new NumberCodec());
const _string = createBuilder(() => new StringCodec());
const _bigint = createBuilder(() => new BigIntCodec());

export {
  _bigint as bigint,
  _bool as bool,
  _null as null,
  _number as number,
  _string as string,
};

export const date = createBuilder(() => new DateCodec());

export const array = createBuilder(
  <const C extends AnyCodec>(codec: C) => new ArrayCodec(codec),
);

export const tuple = createBuilder(
  <const E extends AnyCodec[]>(...elements: E) => new TupleCodec<E>(elements),
);

export const choice = createBuilder(
  <const S extends ChoiceSpec>(spec: S) => new ChoiceCodec(spec),
);

export const option = createBuilder(
  <const C extends AnyCodec>(codec: C) => new OptionCodec(codec),
);

export const record = createBuilder(
  <const Key extends KeyCodec<any>, const Value extends AnyCodec>(
    key: Key,
    value: Value,
  ) => new RecordCodec(key, value),
);

const _object = createBuilder(
  <const S extends ObjectSpec>(spec: S) => new ObjectCodec(spec),
);

export { _object as object };
