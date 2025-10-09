export interface RollupConstEnumOptions {
  /**
   * Which file to scan for const enums.
   * - priority < `files`
   * - default: `['.ts', '.tsx', '.mts', '.cts']`
   */
  suffixes: string[];

  /**
   * Skip `.d.ts` files while scanning.
   * - default: `true`
   */
  skipDts: boolean;

  /**
   * Which file(full path) to scan for const enums.
   * - **ignores `suffixes` while provided**
   * - directly check `path.join(process.cwd(), file)`, should give the full path.
   * - default: `[]` (disabled)
   */
  files: string[];

  /**
   * Skip these directories(full path) while scanning.
   * - directly check `path.join(process.cwd(), file)`, should give the full path.
   * - default: `['.git', 'test', 'tests', 'dist', 'node_modules']`
   */
  excludedDirectories: string[];
}

type KeyValueEntries = [string, string][];

export interface ConstEnumReplacementList {
  /**
   * This list is the replacement used internally. free to use, but **do not modify it**.
   */
  __kskb_replacement_list: [RegExp, KeyValueEntries][];
}
