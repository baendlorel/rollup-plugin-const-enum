export interface RollupConstEnumOptions {
  /**
   * Which file to scan for const enums.
   * - default: `['src/⋆⋆/⋆.ts']`
   */
  constEnumInclude: string[];

  /**
   * Which file not to scan for const enums.
   * - default: `['test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']`
   */
  constEnumExclude: string[];

  /**
   * Which file to inline the const enum values.
   * - default: `['src/⋆⋆/⋆.ts']`
   */
  include: string[];

  /**
   * Which file not to inline the const enum values.
   * - default: `['test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']`
   */
  exclude: string[];
}
