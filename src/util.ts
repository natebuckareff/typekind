import { type AnyCodec, Codec } from './codec.js';
import type { AnySchema } from './schema.js';

export type Simplify<T> = { [K in keyof T]: T[K] } & {};

export interface ToCodec<Type, S extends AnySchema> {
  toCodec(): Codec<Type, S>;
}

// biome-ignore lint/suspicious/noExplicitAny: valid for any type
export type CodecLike = AnyCodec | ToCodec<any, AnySchema>;

export type InferCodecType<T extends CodecLike> = T extends AnyCodec
  ? T['Type']
  : // biome-ignore lint/suspicious/noExplicitAny: valid for any type
    T extends ToCodec<infer Type, any>
    ? Type
    : never;

export type InferCodecSchema<T extends CodecLike> = T extends AnyCodec
  ? T['Schema']
  : // biome-ignore lint/suspicious/noExplicitAny: valid for any type
    T extends ToCodec<any, infer Schema>
    ? Schema
    : never;

export function getSchema<T extends CodecLike>(codec: T): InferCodecSchema<T> {
  if (codec instanceof Codec) {
    return codec.schema() as InferCodecSchema<T>;
  } else {
    return codec.toCodec().schema() as InferCodecSchema<T>;
  }
}
