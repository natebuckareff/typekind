import { Context, Schema, schemaSymbol } from '../core.js';
import { Json } from '../json.js';
import { SchemaError } from '../schema-error.js';

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

  serialize(input: S['Type'], ctx: Context): Json | SchemaError {
    return this.spec.serialize(input, ctx);
  }

  stringify(input: S['Type'], ctx: Context): string | SchemaError {
    return this.spec.stringify(input, ctx);
  }

  parse(input: string, ctx: Context): S['Type'] | SchemaError {
    return this.spec.parse(input, ctx);
  }

  deserialize(input: unknown, ctx: Context): S['Type'] | SchemaError {
    return this.spec.deserialize(input, ctx);
  }

  serializeSchema(): Json | SchemaError {
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
