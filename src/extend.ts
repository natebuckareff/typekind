import { type AnyCodec, tk } from './index.js';

export interface Extensions {
  [key: string]: (...args: any[]) => AnyCodec;
}

export const extendTypeKind = <Ext extends Extensions>(
  fn: () => Ext,
): typeof tk & Ext => {
  return { ...tk, ...fn() };
};
