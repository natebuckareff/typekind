import {
  metadataIsOptional,
  Schema,
  ObjectSpec,
  InferObjectType,
} from './core.js';
import { Json, parseJson, stringifyJson } from './json.js';

export class ObjectSchema<S extends ObjectSpec, M extends {} = {}>
  implements Schema<InferObjectType<S>, M>
{
  readonly schema = undefined!;
  readonly Type = undefined!;

  constructor(readonly spec: S, readonly Metadata: M) {}

  serialize(input: InferObjectType<S>): Json | Error {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return Error('non-object input');
    }

    let out: { [key: string]: Json } | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const hasProperty = key in input;
      const isOptional = metadataIsOptional(spec.Metadata);

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

  stringify(value: InferObjectType<S>): string | TypeError | Error {
    const serialized = this.serialize(value);

    if (serialized instanceof Error) {
      return serialized;
    }

    return stringifyJson(serialized);
  }

  parse(input: string): InferObjectType<S> | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: Json): InferObjectType<S> | Error {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return new Error('non-object json');
    }

    let out: { [key: string]: unknown } | undefined;

    for (const key in this.spec) {
      const spec = this.spec[key];
      const hasProperty = key in input;
      const isOptional = metadataIsOptional(spec.Metadata);

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

    return (out ?? (input as InferObjectType<S>)) as InferObjectType<S>;
  }
}
