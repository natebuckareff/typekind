import { Schema } from './core.js';
import { Json, parseJson, stringifyJson } from './json.js';
import { ObjectSchema } from './object-schema.js';

class StringSchema implements Schema<string, {}> {
  readonly schema = undefined!;
  readonly Type = undefined!;
  readonly Metadata = {};

  serialize(input: string): Json | Error {
    return input;
  }

  stringify(input: string): string | TypeError | Error {
    return stringifyJson(input);
  }

  parse(input: string): string | SyntaxError | Error {
    const json = parseJson(input);

    if (json instanceof Error) {
      return json;
    }

    return this.deserialize(json);
  }

  deserialize(input: unknown): string | Error {
    if (typeof input !== 'string') {
      return Error('invalid type');
    }
    return input;
  }
}

function main() {
  const schema1 = new StringSchema();
  console.log(schema1.serialize('Hello, world!'));
  console.log(schema1.parse('"Hello, world!"'));
  console.log(schema1.parse('true'));

  const schema2 = new ObjectSchema(
    {
      id: new StringSchema(),
      name: new StringSchema(),
    },
    {},
  );

  console.log(schema2.serialize({ id: '1', name: 'Alice' }));
  console.log(schema2.parse(`{ "id": "1", "name": "Alice" }`));
  console.log(schema2.parse(`{ "id": "1", "name": "hello", "foo": 1 }`));
}

main();
