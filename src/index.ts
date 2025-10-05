import { Plugin } from 'rollup';
import { RollupConstEnumOptions } from './types/global.js';

import { normalize } from './options.js';
import { ConstEnumHandler } from './const-enum.js';

const replaceAll =
  typeof String.prototype.replaceAll === 'function'
    ? (s: string, search: any, replace: any) => s.replaceAll(search, replace)
    : (s: string, search: string, replace: string) => {
        return s.split(search).join(replace);
      };

/**
 * ## Usage
 * This is a simple plugin with no ast parsers.
 * It uses regex to detect const enum declarations, and replace them by `String.prototype.replaceAll`(polyfill included).
 *
 * ```ts
 * export default {
 *   ...,
 *   plugins:[
 *     constEnum(), // place it near the front
 *     ...,
 *   ]
 * }
 * ```
 *
 * __PKG_INFO__
 */
export function constEnum(options?: Partial<RollupConstEnumOptions>) {
  const opts = normalize(options);
  const map = new ConstEnumHandler(opts).buildConstEnumMap();

  const plugin: Plugin = {
    name: '__NAME__',
    transform(code, _id) {
      if (map.size === 0) {
        return null;
      }

      let outCode = code;
      for (let i = 0; i < replacers.length; i++) {
        outCode = replaceAll(outCode, replacers[i][0], replacers[i][1]);
      }

      return outCode;
    },
  };

  return plugin;
}
