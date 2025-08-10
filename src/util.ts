import { SchemaError } from './schema-error.js';

export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

export const unwrap = <T>(input: T | SchemaError): T => {
  if (input instanceof Error) {
    throw input;
  }
  return input;
};

export function match<
  T extends { [key: string]: any },
  const K extends keyof UnionToIntersection<T>,
>(
  value: T,
  key: K,
): value is Extract<T, { [P in K]: UnionToIntersection<T>[P] }> {
  return key in value;
}
