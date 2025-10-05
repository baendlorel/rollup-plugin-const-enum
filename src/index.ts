import { Plugin } from 'rollup';
import { RollupConstEnumOptions } from './types/global.js';
import { normalize } from './options.js';

/**
 * __PKG_INFO__
 */
export function constEnum(options?: Partial<RollupConstEnumOptions>) {
  const { include, constEnumInclude } = normalize(options);

  const plugin: Plugin = {
    name: '__NAME__',
    transform(code, id) {},
  };

  return plugin;
}
