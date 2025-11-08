import type { AnyCodec } from './codec.js';
import { createRef, type RefConfig, type RefId } from './ref.js';

export class Context {
  private constructor(
    public path: (number | string)[],
    private registry?: Map<RefId, { codec: AnyCodec; value: unknown }>,
  ) {}

  static create(): Context {
    return new Context([]);
  }

  store<C extends AnyCodec>(
    codec: C,
    value: C['Type'],
    config?: RefConfig<C['Type']>,
  ): C['Type'] {
    this.registry ??= new Map();
    const id = this.registry.size;
    this.registry.set(id, { codec, value });
    return createRef(id, config);
  }

  resolve<C extends AnyCodec>(codec: C, id: RefId): C['Type'] {
    if (this.registry === undefined) {
      throw Error('registiry not initialized');
    }

    const entry = this.registry.get(id);

    if (entry === undefined) {
      throw Error(`ref not found "${id}"`);
    }

    if (codec.schema().type !== entry.codec.schema().type) {
      throw Error(`ref codec mismatch "${id}"`);
    }

    return entry.value;
  }

  clone(key?: number | string): Context {
    const ctx = new Context(this.path.slice(), this.registry);
    return key !== undefined ? ctx.push(key) : ctx;
  }

  push(key: number | string): Context {
    this.path.push(key);
    return this;
  }

  pop(): Context {
    this.path.pop();
    return this;
  }
}
