import { Schema } from './core.js';
import { JsonSchema } from './json.js';
import { ArraySchema } from './schemas/array.js';
import { BoolSchema } from './schemas/bool.js';
import { ChoiceSchema, ChoiceSpec } from './schemas/choice.js';
import { F64Schema } from './schemas/num/f64.js';
import { I32Schema } from './schemas/num/i32.js';
import { I64Schema } from './schemas/num/i64.js';
import { U32Schema } from './schemas/num/u32.js';
import { U64Schema } from './schemas/num/u64.js';
import { OptionSchema } from './schemas/option.js';
import { RecordSchema, RecordSpec } from './schemas/record.js';
import { StringSchema } from './schemas/string.js';
import { TimestampSchema } from './schemas/timestamp.js';
import { TypeSchema } from './schemas/type.js';
import { unwrap } from './util.js';

export function type<S extends Schema<any>>(
  name: string | string[],
  schema: S,
): TypeSchema<S> {
  return unwrap(TypeSchema.create(name, schema));
}

export function record<S extends RecordSpec>(
  name: string | string[],
  spec: S,
): TypeSchema<RecordSchema<S>>;

export function record<S extends RecordSpec>(spec: S): RecordSchema<S>;

export function record(
  nameOrSpec: string | string[] | RecordSpec,
  spec?: RecordSpec,
): TypeSchema<RecordSchema<RecordSpec>> | RecordSchema<RecordSpec> {
  if (typeof nameOrSpec === 'string' || Array.isArray(nameOrSpec)) {
    if (!spec) {
      throw Error('spec is required');
    }
    const schema = unwrap(RecordSchema.create(spec));
    return unwrap(TypeSchema.create(nameOrSpec, schema));
  } else {
    return unwrap(RecordSchema.create(nameOrSpec));
  }
}

export function choice<S extends ChoiceSpec>(
  name: string | string[],
  spec: S,
): TypeSchema<ChoiceSchema<S>>;

export function choice<S extends ChoiceSpec>(spec: S): ChoiceSchema<S>;

export function choice(
  nameOrSpec: string | string[] | ChoiceSpec,
  spec?: ChoiceSpec,
): TypeSchema<ChoiceSchema<ChoiceSpec>> | ChoiceSchema<ChoiceSpec> {
  if (typeof nameOrSpec === 'string' || Array.isArray(nameOrSpec)) {
    if (!spec) {
      throw Error('spec is required');
    }
    const schema = unwrap(ChoiceSchema.create(spec));
    return unwrap(TypeSchema.create(nameOrSpec, schema));
  } else {
    return unwrap(ChoiceSchema.create(nameOrSpec));
  }
}

export const option = <const S extends Schema<any>>(
  spec: S,
): OptionSchema<S> => {
  return unwrap(new OptionSchema(spec));
};

export const array = <const S extends Schema<any>>(spec: S): ArraySchema<S> => {
  return unwrap(new ArraySchema(spec));
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

export const json = cache((): JsonSchema => new JsonSchema());
export const bool = cache((): BoolSchema => new BoolSchema());
export const string = cache((): StringSchema => new StringSchema());
export const timestamp = cache((): TimestampSchema => new TimestampSchema());

export const i32 = cache((): I32Schema => new I32Schema());
export const u32 = cache((): U32Schema => new U32Schema());
export const i64 = cache((): I64Schema => new I64Schema());
export const u64 = cache((): U64Schema => new U64Schema());
export const f64 = cache((): F64Schema => new F64Schema());
