export class Context {
  constructor(public path: (number | string)[] = []) {}

  clone(key?: number | string): Context {
    const ctx = new Context(this.path.slice());
    if (key !== undefined) {
      ctx.path.push(key);
    }
    return ctx;
  }

  pop(): Context {
    this.path.pop();
    return this;
  }
}
