import { AnyCodec } from './codec.js';
import { Context } from './context.js';

export class CodecError extends Error {
  constructor(message: string, ctx?: Context) {
    super(renderErrorMessage(message, ctx));
  }

  static throw(
    codec: AnyCodec | string | (AnyCodec | string)[],
    value: unknown,
    ctx?: Context,
  ): never {
    CodecError.throwExplicit(codec, typeof value, ctx);
  }

  // TODO: migrate `throw` to this
  static throwExplicit(
    codec: AnyCodec | string | (AnyCodec | string)[],
    got: string,
    ctx?: Context,
  ): never {
    const name = (x: AnyCodec | string): string => {
      return `"${typeof x === 'string' ? x : x.schema().type}"`;
    };
    const expected = Array.isArray(codec)
      ? `expected one of (${codec.map(name).join(', ')})`
      : `expected ${name(codec)}`;

    throw new CodecError(`${expected} but got "${got}"`, ctx);
  }
}

function renderErrorMessage(message: string, ctx?: Context) {
  const at = ctx ? renderPath(ctx.path) : '';
  return `${message}${at}`;
}

function renderPath(path: (number | string)[]): string {
  if (path.length === 0) {
    return '';
  }
  if (path.length === 1) {
    return typeof path[0] === 'number'
      ? ` (at index ${path[0]})`
      : ` (at property ${JSON.stringify(path[0])})`;
  }
  return ` (at ${path.map(renderPathlet).join('.')})`;
}

function renderPathlet(value: number | string) {
  if (typeof value === 'number') {
    return value.toString();
  }

  if (/^[a-zA-Z0-9_]+$/.test(value)) {
    return `${value}`;
  } else {
    return `[${JSON.stringify(value)}]`;
  }
}
