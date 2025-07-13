import { Schema, schemaSymbol } from '../core.js';
import { Json } from '../json.js';

const oneOrMore = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

export class TypeSchema<S extends Schema<any>> implements Schema<S['Type']> {
  readonly [schemaSymbol] = undefined!;
  readonly Type: S['Type'] = undefined!;

  private constructor(readonly path: string[], readonly spec: S) {}

  static create<S extends Schema<any>>(
    path: string | string[],
    spec: S,
  ): TypeSchema<S> {
    const pathOrName = oneOrMore(path);
    for (const part of pathOrName) {
      if (part.startsWith('$') || part.includes('.') || part.includes(':')) {
        throw new Error('invalid schema path');
      }
    }
    return new TypeSchema(pathOrName, spec);
  }

  serialize(input: S['Type']): Json | Error {
    return this.spec.serialize(input);
  }

  stringify(input: S['Type']): string | TypeError | Error {
    return this.spec.stringify(input);
  }

  parse(input: string): S['Type'] | SyntaxError | Error {
    return this.spec.parse(input);
  }

  deserialize(input: unknown): S['Type'] | Error {
    return this.spec.deserialize(input);
  }

  serializeSchema(): Json | Error {
    const bodySchema = this.spec.serializeSchema();

    if (bodySchema instanceof Error) {
      return bodySchema;
    }

    const schema: Json = {
      $type: this.path.join('.'),
      schema: bodySchema,
    };

    return schema;
  }
}
