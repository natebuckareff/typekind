import { Context } from './core.js';

export class SchemaError extends Error {
  constructor(
    message: string,
    public readonly ctx: Context,
    public readonly cause?: Error,
  ) {
    if (ctx.path.length > 0) {
      const path = ctx.path.map(x => JSON.stringify(x)).join('.');
      super(message + ` at ${path}`);
    } else {
      super(message);
    }
  }
}
