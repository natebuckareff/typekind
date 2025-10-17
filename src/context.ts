export class Context {
  constructor(public path: (number | string)[] = []) {}

  clone(key?: number | string): Context {
    const ctx = new Context(this.path.slice());
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
