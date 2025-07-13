import { Schema } from './core.js';
import { BoolSchema } from './schemas/bool.js';
import { ChoiceSchema, ChoiceSpec } from './schemas/choice.js';
import { F64Schema } from './schemas/num/f64.js';
import { I32Schema } from './schemas/num/i32.js';
import { I64Schema } from './schemas/num/i64.js';
import { U32Schema } from './schemas/num/u32.js';
import { U64Schema } from './schemas/num/u64.js';
import { OptionalSchema } from './schemas/optional.js';
import { RecordSchema, RecordSpec } from './schemas/record.js';
import { StringSchema } from './schemas/string.js';
import { unwrap } from './util.js';

export const record = <S extends RecordSpec>(spec: S): RecordSchema<S> => {
  return unwrap(RecordSchema.create(spec));
};

export const choice = <S extends ChoiceSpec>(spec: S): ChoiceSchema<S> => {
  return unwrap(ChoiceSchema.create(spec));
};

export const some = <const S extends Schema<any>>(
  spec: S,
): OptionalSchema<S> => {
  return unwrap(new OptionalSchema(spec));
};

const __cache = new Map<() => unknown, unknown>();

const cache = <T>(fn: () => T): (() => T) => {
  return () => {
    const entry = __cache.get(fn);
    if (entry) {
      return entry as T;
    }
    const result = fn();
    __cache.set(fn, result);
    return result;
  };
};

export const bool = cache((): BoolSchema => new BoolSchema());
export const string = cache((): StringSchema => new StringSchema());
export const i32 = cache((): I32Schema => new I32Schema());
export const u32 = cache((): U32Schema => new U32Schema());
export const i64 = cache((): I64Schema => new I64Schema());
export const u64 = cache((): U64Schema => new U64Schema());
export const f64 = cache((): F64Schema => new F64Schema());
