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
import { U32Codec } from './codecs/u32.js';
import { U64Codec } from './codecs/u64.js';

export const i32 = createBuilder(I32Codec);
export const i64 = createBuilder(I64Codec);
export const u32 = createBuilder(U32Codec);
export const u64 = createBuilder(U64Codec);

const _null = createBuilder(NullCodec);
const _bool = createBuilder(BoolCodec);
const _number = createBuilder(NumberCodec);
const _string = createBuilder(StringCodec);
const _bigint = createBuilder(BigIntCodec);

export {
  _bigint as bigint,
  _bool as bool,
  _null as null,
  _number as number,
  _string as string,
};

export const date = createBuilder(DateCodec);

export const array = createBuilder(
  ArrayCodec,
  <C extends AnyCodec>(codec: C) => {
    return new ArrayCodec(codec);
  },
);

export const choice = createBuilder(
  ChoiceCodec,
  <S extends ChoiceSpec>(spec: S) => {
    return new ChoiceCodec(spec);
  },
);

export const option = createBuilder(
  OptionCodec,
  <S extends AnyCodec>(spec: S) => {
    return new OptionCodec(spec);
  },
);

export const record = createBuilder(
  RecordCodec,
  <Key extends KeyCodec<any>, Value extends AnyCodec>(
    key: Key,
    value: Value,
  ) => {
    return new RecordCodec(key, value);
  },
);

const _object = createBuilder(ObjectCodec, <S extends ObjectSpec>(spec: S) => {
  return new ObjectCodec(spec);
});

export { _object as object };
