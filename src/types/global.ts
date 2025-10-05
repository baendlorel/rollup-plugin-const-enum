export interface RollupConstEnumOptions {
  /**
   * Which file to scan for const enums.
   * - default: `['⋆⋆/⋆.ts', '⋆⋆/⋆.tsx', '⋆⋆/⋆.mts', '⋆⋆/⋆.cts']`
   */
  constEnumInclude: string[];

  /**
   * Which file not to scan for const enums.
   * - default: `['⋆⋆/⋆.d.ts', '.git/⋆⋆', 'test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']`
   */
  constEnumExclude: string[];

  /**
   * Which file to inline the const enum values.
   * - default: `['⋆⋆/⋆.ts', '⋆⋆/⋆.tsx', '⋆⋆/⋆.mts', '⋆⋆/⋆.cts']`
   */
  include: string[];

  /**
   * Which file not to inline the const enum values.
   * - default: `['⋆⋆/⋆.d.ts', '.git/⋆⋆', 'test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']`
   */
  exclude: string[];
}
