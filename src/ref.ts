/** biome-ignore-all lint/suspicious/noExplicitAny: required for proxy handlers */

import type { AnyCodec } from './codec.js';
import { CodecError } from './codec-error.js';
import type { Context } from './context.js';
import { isArray, type Json } from './json.js';

const ref = () => {};
const refSymbol = Symbol('ref');

const block = (action: string) => (): never => throwError(action);

const throwError = (action: string): never => {
  throw Error(`cannot ${action} a ref placeholder value`);
};

export interface Ref {
  id: number;
  serialize?: (proxy: RefProxy, ref: Ref) => number | undefined;
}

export interface RefProxy {
  [refSymbol]: Ref;
}

export interface RefConfig<T> {
  handler?: {
    has?: (target: T, p: string | symbol) => boolean;
    get?: (target: T, p: string | symbol, receiver: any) => any;
    apply?: (target: T, thisArg: any, argArray: any[]) => any;
  };
  serialize?: (proxy: RefProxy, ref: Ref) => number | undefined;
}

export function isRefProxy(value: unknown): value is RefProxy {
  return typeof value === 'function' && refSymbol in value;
}

export function unwrapRef(value: unknown): Ref | undefined {
  if (isRefProxy(value)) {
    return value[refSymbol];
  }
}

export function trySerializeRef<T>(value: T): ['@ref', number] | undefined {
  if (isRefProxy(value)) {
    const ref = value[refSymbol];
    const override = ref.serialize?.(value, ref);
    const id = override === undefined ? ref.id : override;
    return ['@ref', id];
  }
}

export function tryDeserializeRef<C extends AnyCodec>(
  codec: C,
  value: Json,
  ctx?: Context,
): C['Type'] | undefined {
  if (isArray(value) && value.length === 2) {
    if (value[0] === '@ref') {
      const id = value[1];
      const typeOf = typeof id;
      if (typeOf !== 'number') {
        CodecError.throw('numeric ref value', typeOf, ctx);
      }
      if (ctx === undefined) {
        throw Error('context is required to deserialize refs');
      }
      return ctx.resolve(codec, id as number);
    }
  }
}

export function createRef<T extends object>(
  id: number,
  config?: RefConfig<T>,
): T {
  return new Proxy<T>(ref as T, {
    construct: block('construct'),
    has(target, p) {
      if (p === refSymbol) {
        return true;
      }
      const f = config?.handler?.has;
      if (f) {
        return f(target, p);
      } else {
        return throwError('check properties of');
      }
    },
    get(target, p, receiver) {
      if (p === refSymbol) {
        const value: Ref = { id };
        if (config?.serialize) {
          value.serialize = config.serialize;
        }
        return value;
      }
      const f = config?.handler?.get;
      if (f) {
        return f(target, p, receiver);
      } else {
        return throwError('read properties of');
      }
    },
    apply(target, thisArg, argArray) {
      const f = config?.handler?.apply;
      if (f) {
        return f(target, thisArg, argArray);
      } else {
        return throwError('call');
      }
    },
    set: block('set properties of'),
    defineProperty: block('define properties of'),
    deleteProperty: block('delete properties of'),
    getOwnPropertyDescriptor: block('get descriptor of'),
    ownKeys: block('get own keys of'),
  });
}
