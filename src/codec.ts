import type { Context } from './context.js';
import { type Json, parseJson, stringifyJson } from './json.js';
import { tryDeserializeRef, trySerializeRef } from './ref.js';
import type { AnySchema } from './schema.js';

// TODO: figure out best-practices for global debug toggle
export const DEBUG = true;

export type AnyCodec = Codec<any, AnySchema>;

export abstract class Codec<Type, S extends AnySchema> {
  get Type(): Type {
    return undefined!;
  }

  get Schema(): S {
    return undefined!;
  }

  stringify(
    value: Type,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number,
    ctx?: Context,
  ): string;

  stringify(
    value: Type,
    replacer?: (number | string)[] | null,
    space?: string | number,
    ctx?: Context,
  ): string;

  stringify(
    value: Type,
    replacer?: any,
    space?: string | number,
    ctx?: Context,
  ): string {
    const serialized = this.serialize(value, ctx);
    return stringifyJson(serialized, replacer, space);
  }

  parse(
    text: string,
    reviver?: (this: any, key: string, value: any) => any,
    ctx?: Context,
  ): Type {
    const json = parseJson(text, reviver);
    return this.deserialize(json, ctx);
  }

  get(_: number | string): AnyCodec {
    throw Error(`cannot get sub-codec for "${this.constructor.name}"`);
  }

  serialize(value: Type, ctx?: Context): Json {
    const ref = trySerializeRef(value);
    if (ref === undefined) {
      const result = this.serializeImpl(value, ctx);
      if (DEBUG) {
        if (Array.isArray(result)) {
          if (result.length === 2 && result[0] === '@ref') {
            throw Error(
              'the 2-tuple with "@ref" prefix is reserved for internal use',
            );
          }
        }
      }
      return result;
    } else {
      return ref;
    }
  }

  deserialize(value: Json, ctx?: Context): Type {
    const unref = tryDeserializeRef(this, value, ctx);
    if (unref === undefined) {
      return this.deserializeImpl(value, ctx);
    } else {
      return unref;
    }
  }

  abstract schema(): S;

  protected abstract serializeImpl(value: Type, ctx?: Context): Json;
  protected abstract deserializeImpl(value: Json, ctx?: Context): Type;
}
