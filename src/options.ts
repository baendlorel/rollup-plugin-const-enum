import { createFilter } from '@rollup/pluginutils';
import { RollupConstEnumOptions } from './types/global.js';

export function normalize(options: Partial<RollupConstEnumOptions> = {}) {
  const {
    constEnumInclude = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.mts'],
    constEnumExclude = ['**/*.d.ts', 'test/**', 'tests/**', 'dist/**', 'node_modules/**'],
    include = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.mts'],
    exclude = ['**/*.d.ts', 'test/**', 'tests/**', 'dist/**', 'node_modules/**'],
  } = Object(options) as RollupConstEnumOptions;

  return {
    include: createFilter(include, exclude),
    constEnumInclude: createFilter(constEnumInclude, constEnumExclude),
  };
}
