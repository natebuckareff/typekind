export type AnySchema = Schema<any, any>;

export class Schema<Name extends string, Type> {
  public readonly Type!: Type;
  public readonly type: Name;

  constructor(name: Name) {
    this.type = name;
  }
}
