import { AnyCodec } from './codec.js';
import { Context } from './context.js';

export class CodecError extends Error {
  constructor(message: string, ctx?: Context) {
    super(renderErrorMessage(message, ctx));
  }

  static throw(codec: AnyCodec, value: unknown, ctx?: Context): never {
    throw new CodecError(
      `expected "${codec.schema().type}" got "${typeof value}"`,
      ctx,
    );
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
