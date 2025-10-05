export interface RollupConstEnumOptions {
  /**
   * Which file to scan for const enums.
   * - default: `['src/⋆⋆/⋆.ts', 'src/⋆⋆/⋆.tsx', 'src/⋆⋆/⋆.mts']`
   */
  constEnumInclude: string[];

  /**
   * Which file not to scan for const enums.
   * - default: `['⋆⋆/⋆.d.ts', 'test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']`
   */
  constEnumExclude: string[];

  /**
   * Which file to inline the const enum values.
   * - default: `['src/⋆⋆/⋆.ts', 'src/⋆⋆/⋆.tsx', 'src/⋆⋆/⋆.mts']`
   */
  include: string[];

  /**
   * Which file not to inline the const enum values.
   * - default: `['⋆⋆/⋆.d.ts', 'test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']`
   */
  exclude: string[];
}
