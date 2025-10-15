import { CodecError } from '../codec-error.js';
import { AnyCodec, Codec } from '../codec.js';
import { Context } from '../context.js';
import { isObject, Json } from '../json.js';
import { AnySchema, Schema } from '../schema.js';
import { Simplify } from '../util.js';
import { OptionCodec } from './option.js';

export type ObjectSpec = {
  [key: string]: AnyCodec;
};

export type InferObjectType<Spec extends ObjectSpec> = Simplify<
  {
    [K in keyof Spec as Spec[K] extends OptionCodec<any>
      ? never
      : K]: Spec[K]['Type'];
  } & {
    [K in keyof Spec as Spec[K] extends OptionCodec<any>
      ? K
      : never]?: Spec[K]['Type'];
  }
>;

export class ObjectSchema<Type> extends Schema<'object', Type> {
  constructor(public readonly properties: { [K: string]: AnySchema }) {
    super('object');
  }
}

export class ObjectCodec<Spec extends ObjectSpec> extends Codec<
  InferObjectType<Spec>,
  ObjectSchema<InferObjectType<Spec>>
> {
  constructor(public readonly spec: Spec) {
    super();
  }

  schema(): ObjectSchema<InferObjectType<Spec>> {
    const schema: Record<string, AnySchema> = {};
    for (const [key, codec] of Object.entries(this.spec)) {
      schema[key] = codec.schema();
    }
    return new ObjectSchema(schema);
  }

  private _checkForMissing(value: any, ctx: Context) {
    for (const prop in this.spec) {
      if (!(prop in value)) {
        throw new CodecError(
          `missing property: ${JSON.stringify(prop)}`,
          ctx.clone(prop).pop(),
        );
      }
    }
  }

  serialize(value: this['Type'], ctx?: Context): Json {
    ctx ??= new Context();
    let out: any | undefined;

    this._checkForMissing(value, ctx);

    for (const prop in value) {
      const field = value[prop];
      const codec = this.spec[prop];
      if (!codec) {
        throw new CodecError(
          `unexpected property: ${JSON.stringify(prop)}`,
          ctx.clone(prop).pop(),
        );
      }
      const serialized = codec.serialize(field, ctx.clone(prop));
      if (!out && field !== serialized) {
        out = { ...(value as object) };
      }
      if (out) {
        out[prop] = serialized;
      }
    }
    return out ?? value;
  }

  deserialize(value: Json, ctx?: Context): this['Type'] {
    if (!isObject(value)) {
      CodecError.throw(this, value, ctx);
    }

    ctx ??= new Context();
    let out: any | undefined;

    this._checkForMissing(value, ctx);

    for (const prop in value) {
      const field = value[prop];
      const codec = this.spec[prop];
      if (!codec) {
        throw new CodecError(
          `unexpected property: ${JSON.stringify(prop)}`,
          ctx.clone(prop).pop(),
        );
      }
      const serialized = codec.serialize(field, ctx.clone(prop));
      if (!out && field !== serialized) {
        out = { ...(value as object) };
      }
      if (out) {
        out[prop] = serialized;
      }
    }
    return out ?? value;
  }
}
