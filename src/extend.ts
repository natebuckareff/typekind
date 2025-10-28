import type { Builder } from './builder.js';
import { tk } from './index.js';

export interface Extensions {
  [key: string]: Builder;
}

export function extendTypeKind<Ext extends Extensions>(
  ext: Ext,
): typeof tk & Ext;

export function extendTypeKind<Base extends Extensions, Ext extends Extensions>(
  base: Base,
  ext: Ext,
): Base & Ext;

export function extendTypeKind(
  extOrBase: Extensions,
  ext?: Extensions,
): Extensions {
  if (ext === undefined) {
    return { ...tk, ...extOrBase };
  } else {
    return { ...extOrBase, ...ext };
  }
}
