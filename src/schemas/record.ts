import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';
import { Simplify } from './choice.js';
import { OptionSchema } from './option.js';

export type RecordSpec = {
  [property: string]: Schema<any>;
};

export type InferRecordType<S extends RecordSpec> = Simplify<
  {
    [K in keyof S as S[K] extends OptionSchema<any>
      ? K
      : never]?: S[K] extends OptionSchema<any>
      ? S[K]['Type'] | undefined
      : never;
  } & {
    [K in keyof S as S[K] extends OptionSchema<any>
      ? never
      : K]: S[K] extends Schema<any> ? S[K]['Type'] : never;
  }
>;

export class RecordSchema<S extends RecordSpec>
  implements Schema<InferRecordType<S>>
{
  readonly [schemaSymbol] = undefined!;
  readonly Type: InferRecordType<S> = undefined!;

  private constructor(readonly spec: S) {}

  static create<S extends RecordSpec>(spec: S): RecordSchema<S> | Error {
    for (const key in spec) {
      if (key.startsWith('$')) {
        return Error('reserved property');
      }
    }

    return new RecordSchema(spec);
  }

  serialize(input: InferRecordType<S>): Json | Error {
    let out: { [key: string]: Json } | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const hasProperty = key in input;
      const isOptional = spec instanceof OptionSchema;

      if (!hasProperty && !isOptional) {
        return Error('missing required property');
      }
    }

    for (const key in input) {
      const value = input[key];
      const spec = this.spec[key];

      if (spec === undefined) {
        return Error('unknown property');
      }

      const serializedValue = spec.serialize(value);

      if (serializedValue instanceof Error) {
        return serializedValue;
      }

      if (value !== serializedValue) {
        out ??= { ...(input as { [key: string]: Json }) };
        out[key] = serializedValue;
      }
    }

    return out ?? (input as Json);
  }

  stringify(value: InferRecordType<S>): string | TypeError | Error {
    const serialized = this.serialize(value);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized);
  }

  parse(input: string): InferRecordType<S> | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: Json): InferRecordType<S> | Error {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return new Error('non-object json');
    }

    let out: { [key: string]: unknown } | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const hasProperty = key in input;
      const isOptional = spec instanceof OptionSchema;

      if (!hasProperty && !isOptional) {
        return Error('missing required property');
      }
    }

    for (const key in input) {
      const value = input[key];
      const spec = this.spec[key];

      if (spec === undefined) {
        return Error('unexpected property');
      }

      const deserializedValue = spec.deserialize(value);

      if (deserializedValue instanceof Error) {
        return deserializedValue;
      }

      if (value !== deserializedValue) {
        out ??= { ...(input as { [key: string]: Json }) };
        out[key] = deserializedValue;
      }
    }

    return (out ?? (input as InferRecordType<S>)) as InferRecordType<S>;
  }

  serializeSchema(): Json | Error {
    const schema: Json = {};

    for (const key in this.spec) {
      const spec = this.spec[key];
      const serializedSchema = spec.serializeSchema();

      if (serializedSchema instanceof Error) {
        return serializedSchema;
      }

      schema[key] = serializedSchema;
    }

    return schema;
  }
}
