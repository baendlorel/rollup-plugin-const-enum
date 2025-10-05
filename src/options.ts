import { createFilter } from '@rollup/pluginutils';
import { RollupConstEnumOptions } from './types/global.js';

const DEFAULT_EXCLUDE = [
  '**/*.d.ts',
  '.git/**',
  'test/**',
  'tests/**',
  'dist/**',
  'node_modules/**',
];
const DEFAULT_INCLUDE = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

export function normalize(options: Partial<RollupConstEnumOptions> = {}) {
  const {
    constEnumInclude = DEFAULT_INCLUDE,
    constEnumExclude = DEFAULT_EXCLUDE,
    include = DEFAULT_INCLUDE,
    exclude = DEFAULT_EXCLUDE,
  } = Object(options) as RollupConstEnumOptions;

  return {
    include: createFilter(include, exclude),
    constEnumInclude: createFilter(constEnumInclude, constEnumExclude),
  };
}
