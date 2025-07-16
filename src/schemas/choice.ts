import { Schema, schemaSymbol } from '../core.js';
import { Json, parseJson, stringifyJson } from '../json.js';

export type ChoiceSpec = {
  [property: string]: Schema<any> | null;
};

export type InferChoiceType<S extends ChoiceSpec> = Simplify<
  {
    [K in keyof S]: {
      [P in K]: S[K] extends Schema<any> ? S[K]['Type'] : null;
    };
  }[keyof S]
>;

export type Simplify<T> = T extends any[] | Date
  ? T
  : { [K in keyof T]: T[K] } & {};

export class ChoiceSchema<S extends ChoiceSpec>
  implements Schema<InferChoiceType<S>>
{
  readonly [schemaSymbol] = undefined!;
  readonly Type: InferChoiceType<S> = undefined!;

  private constructor(readonly spec: S) {}

  static create<S extends ChoiceSpec>(spec: S): ChoiceSchema<S> | Error {
    let atLeastOneVariant = false;
    for (const key in spec) {
      if (key.startsWith('$')) {
        return Error('reserved property');
      }
      atLeastOneVariant = true;
    }

    if (!atLeastOneVariant) {
      return Error('empty choice spec');
    }

    return new ChoiceSchema(spec);
  }

  serialize(input: InferChoiceType<S>): Json | Error {
    let error: Error | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];

      if (spec === null) {
        if (input !== undefined) {
          error = Error('expected unit value');
          continue;
        }

        return null;
      } else {
        const serializedValue = spec.serialize(input);

        if (serializedValue instanceof Error) {
          error = serializedValue;
          continue;
        }

        return serializedValue;
      }
    }

    if (!error) {
      throw Error('empty choice spec');
    }

    return Error('no variant matched');
  }

  stringify(input: InferChoiceType<S>): string | TypeError | Error {
    const serialized = this.serialize(input);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized);
  }

  parse(input: string): InferChoiceType<S> | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): InferChoiceType<S> | Error {
    let error: Error | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];

      if (spec === null) {
        if (input !== undefined) {
          error = Error('expected unit value');
          continue;
        }

        return { [key]: null } as InferChoiceType<S>;
      } else {
        const deserializedValue = spec.deserialize(input);

        if (deserializedValue instanceof Error) {
          error = deserializedValue;
          continue;
        }

        return deserializedValue;
      }
    }

    if (!error) {
      throw Error('empty choice spec');
    }

    return Error('no variant matched');
  }

  serializeSchema(): Json | Error {
    const schema: Json = {
      $type: '$choice',
    };

    for (const key in this.spec) {
      const spec = this.spec[key];

      if (spec === null) {
        schema[key] = null;
      } else {
        const serializedSchema = spec.serializeSchema();

        if (serializedSchema instanceof Error) {
          return serializedSchema;
        }

        schema[key] = serializedSchema;
      }
    }

    return schema;
  }
}
