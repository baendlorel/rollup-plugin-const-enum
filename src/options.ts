import { createFilter } from '@rollup/pluginutils';
import { RollupConstEnumOptions } from './types/global.js';

export function normalize(options: Partial<RollupConstEnumOptions> = {}) {
  const {
    constEnumInclude = ['src/**'],
    constEnumExclude = ['test/**', 'tests/**', 'dist/**', 'node_modules/**'],
    include = ['src/**'],
    exclude = ['test/**', 'tests/**', 'dist/**', 'node_modules/**'],
  } = Object(options) as RollupConstEnumOptions;

  return {
    include: createFilter(include, exclude),
    constEnumInclude: createFilter(constEnumInclude, constEnumExclude),
  };
}
