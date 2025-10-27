import type { Context } from './context.js';
import { type Json, parseJson, stringifyJson } from './json.js';
import type { AnySchema } from './schema.js';

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

  abstract schema(): S;
  abstract serialize(value: Type, ctx?: Context): Json;
  abstract deserialize(value: Json, ctx?: Context): Type;
}
