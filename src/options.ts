import { RollupConstEnumOptions } from './types/global.js';

const isStringArray = (value: any): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

export function normalize(options: Partial<RollupConstEnumOptions> = {}) {
  const {
    suffixes = ['.ts', '.tsx', '.mts', '.cts'],
    files = [],
    excludedDirectories = ['.git', 'test', 'tests', 'dist', 'node_modules'],
    skipDts = true,
  } = Object(options) as RollupConstEnumOptions;

  if (!isStringArray(suffixes)) {
    throw new TypeError(`Invalid option 'suffixes': expected an array of strings.`);
  }

  if (!isStringArray(files)) {
    throw new TypeError(`Invalid option 'files': expected an array of strings.`);
  }

  if (!isStringArray(excludedDirectories)) {
    throw new TypeError(`Invalid option 'excludedDirectories': expected an array of strings.`);
  }

  return {
    suffixes,
    files,
    excludedDirectories,
    skipDts,
  };
}
