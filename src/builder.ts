import _memoize, { type CacheConstructor } from 'trie-memoize';
import type { AnyCodec } from './codec.js';

const memoize: typeof import('trie-memoize').default =
  _memoize.default ?? _memoize;

export type Builder = (...args: any[]) => AnyCodec;

export function createBuilder<const T extends Builder>(fn: T): T {
  if (fn.length === 0) {
    return fn;
  }
  const mapConstructors: CacheConstructor[] = [];
  for (let i = 0; i < fn.length; ++i) {
    mapConstructors.push(WeakMap);
  }
  const cached = memoize(mapConstructors, fn);
  return cached as T;
}

export const rec = <C extends AnyCodec>(fn: () => C) => fn();
