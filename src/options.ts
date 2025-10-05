import { RollupConstEnumOptions } from './types/global.js';

const expectStringArray = (value: any, name: string) => {
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    throw new TypeError(`Expected ${name} to be string[].`);
  }
};

export function normalize(options: Partial<RollupConstEnumOptions> = {}) {
  const {
    suffixes = ['.ts', '.tsx', '.mts', '.cts'],
    files = [],
    excludedDirectories = ['.git', 'test', 'tests', 'dist', 'node_modules'],
    skipDts = true,
  } = Object(options) as RollupConstEnumOptions;

  expectStringArray(suffixes, 'suffixes');
  expectStringArray(files, 'files');
  expectStringArray(excludedDirectories, 'excludedDirectories');

  return {
    suffixes,
    files,
    excludedDirectories,
    skipDts,
  };
}
