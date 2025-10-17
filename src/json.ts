export type Json = null | boolean | number | string | Json[] | JsonObject;
export type JsonObject = { [key: string]: Json };

export function stringifyJson(
  json: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string;

export function stringifyJson(
  json: any,
  replacer?: (number | string)[] | null,
  space?: string | number,
): string;

export function stringifyJson(
  json: any,
  replacer?: any,
  space?: string | number,
): string;

export function stringifyJson(
  json: any,
  replacer?: any,
  space?: string | number,
): string {
  return JSON.stringify(json, replacer, space);
}

export function parseJson(
  input: string,
  reviver?: (this: any, key: string, value: any) => any,
): Json {
  return JSON.parse(input, reviver);
}

export function isNull(json: Json): json is null {
  return json === null;
}

export function isBoolean(json: Json): json is boolean {
  return typeof json === 'boolean';
}

export function isNumber(json: Json): json is number {
  return typeof json === 'number';
}

export function isString(json: Json): json is string {
  return typeof json === 'string';
}

export function isRegex(json: Json, regex: RegExp): json is string {
  return typeof json === 'string' && regex.test(json);
}

export function isArray(json: Json): json is Json[] {
  return Array.isArray(json);
}

export function isObject(json: Json): json is JsonObject {
  return typeof json === 'object' && json !== null;
}
