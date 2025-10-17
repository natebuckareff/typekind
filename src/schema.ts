export type AnySchema = Schema<any>;

export class Schema<Name extends string> {
  public readonly type: Name;

  constructor(name: Name) {
    this.type = name;
  }
}
