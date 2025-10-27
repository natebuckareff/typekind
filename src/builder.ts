import type { AnyCodec } from './codec.js';

export type Builder<C extends AnyCodec, Args extends any[]> = (
  ...args: Args
) => C;

export function createBuilder<C extends AnyCodec>(
  cls: new () => C,
): Builder<C, []>;

export function createBuilder<C extends AnyCodec, Args extends any[]>(
  cls: new (...args: Args) => C,
  fn: (...args: Args) => C,
): Builder<C, Args>;

export function createBuilder<C extends AnyCodec, Args extends any[]>(
  cls: new (...args: Args) => C,
  fn?: () => C,
): Builder<C, Args> {
  if (fn) {
    return fn as Builder<C, Args>;
  } else {
    // caching for unary builders
    const codec = new (cls as new () => C)();
    const fn = () => codec;
    return fn as Builder<C, Args>;
  }
}

export const rec = <C extends AnyCodec>(fn: () => C) => fn();
