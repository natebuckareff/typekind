import { Schema, schemaSymbol } from '../core.js';
import { Json } from '../json.js';
import { RecordSchema } from './record.js';

export class TypeSchema<T, M extends {} = {}> implements Schema<T, M> {
  readonly [schemaSymbol] = undefined!;
  readonly Type = undefined!;

  private constructor(
    readonly path: string[],
    readonly schema: Schema<T, M>,
    readonly Metadata: M,
  ) {}

  static create<T, M extends {} = {}>(
    path: string[],
    schema: Schema<T, M>,
    Metadata: M,
  ): TypeSchema<T, M> {
    if (path.some(part => part.includes('.') || part.includes(':'))) {
      throw new Error('invalid schema path');
    }

    return new TypeSchema(path, schema, Metadata);
  }

  serialize(input: T): Json | Error {
    return this.schema.serialize(input);
  }

  stringify(input: T): string | TypeError | Error {
    return this.schema.stringify(input);
  }

  parse(input: string): T | SyntaxError | Error {
    return this.schema.parse(input);
  }

  deserialize(input: unknown): T | Error {
    return this.schema.deserialize(input);
  }

  serializeSchema(): Json | Error {
    if (this.schema instanceof RecordSchema) {
      const schema: Json = {
        $schema: this.path.join('.'),
      };

      for (const key in this.schema.spec) {
        const spec = this.schema.spec[key];
        const serializedSchema = spec.serializeSchema();

        if (serializedSchema instanceof Error) {
          return serializedSchema;
        }

        schema[key] = serializedSchema;
      }

      //
    } else {
      // Type alias
    }

    return this.schema.serializeSchema();
  }

  private _serializeObjectSchema(
    objectSchema: RecordSchema<any, any>,
  ): Json | Error {
    const schema: Json = {
      $schema: this.path.join('.'),
    };

    for (const key in objectSchema.spec) {
      const spec = objectSchema.spec[key];
      const serializedSchema = spec.serializeSchema();

      if (serializedSchema instanceof Error) {
        return serializedSchema;
      }

      schema[key] = serializedSchema;
    }

    return schema;
  }
}
